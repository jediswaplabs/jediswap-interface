import { BigNumber } from '@ethersproject/bignumber'
import {Contract, uint256, stark, RawArgs, Call, CallData, cairo} from 'starknet'
import { JSBI, Percent, Router, SwapParameters, Trade, TradeType } from '@jediswap/sdk'
import { useMemo } from 'react'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { useTransactionAdder } from '../state/transactions/hooks'
import { isAddress, shortenAddress } from '../utils'
import { useRouterContract } from './useContract'
import isZero from '../utils/isZero'
import useTransactionDeadline from './useTransactionDeadline'
// import useENS from './useENS'
import { useApprovalCallFromTrade } from './useApproveCall'
import { useAccountDetails } from '.'
import {useContractWrite, useProvider} from "@starknet-react/core";

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

interface SwapCall {
  contract: Contract
  parameters: SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate?: BigNumber
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const { address, account, chainId } = useAccountDetails()

  // const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? address : recipientAddressOrName

  const deadline = useTransactionDeadline()

  const contract: Contract | null = useRouterContract()

  return useMemo(() => {
    if (!trade || !recipient || !account || !chainId || !deadline || !address) {
      return []
    }

    //
    if (!contract) {
      return []
    }

    const swapMethods: any[] = []

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient,
        deadline: deadline.toNumber()
      })
    )

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient,
          deadline: deadline.toNumber()
        })
      )
    }
    return swapMethods.map(parameters => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, address, contract, deadline, recipient, trade])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId } = useAccountDetails()

  const approvalCallback = useApprovalCallFromTrade(trade, allowedSlippage)
  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)

  const addTransaction = useTransactionAdder()
  const recipient = recipientAddressOrName === null ? account : recipientAddressOrName

  return useMemo(() => {
    if (!trade || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(call => {
            const {
              parameters: { methodName, args, value }
            } = call

            return { call }
          })
        )

        const approval = approvalCallback()

        if (!approval) {
          throw new Error('Unexpected Approval Call error')
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value }
          }
        } = estimatedCalls[0]

        const [amountIn, amountOut, path, to, deadline] = args

        const uint256AmountIn = cairo.uint256(amountIn as string)
        const uint256AmountOut = cairo.uint256(amountOut as string)

        let swapArgs: RawArgs = {
          path,
          to,
          deadline
        }

        switch (methodName) {
          case 'swap_tokens_for_exact_tokens': {
            swapArgs = {
              ...swapArgs,
              amountInMax: { type: 'struct', ...uint256AmountOut },
              amountOut: { type: 'struct', ...uint256AmountIn },
            }
            break;
          }
          case 'swap_exact_tokens_for_tokens':
          default: {
            swapArgs = {
              ...swapArgs,
              amountIn: { type: 'struct', ...uint256AmountIn },
              amountOutMin: { type: 'struct', ...uint256AmountOut },
            }
            break;
          }
        }

        const contractCallData = new CallData(contract.abi);
        const swapCalldata = contractCallData.compile(methodName, swapArgs);

        const swapCall: Call = {
          contractAddress: contract.address,
          entrypoint: methodName,
          calldata: swapCalldata
        }

        return account
          .execute([approval, swapCall])
          .then(response => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = trade.outputAmount.currency.symbol
            const inputAmount = trade.inputAmount.toSignificant(3)
            const outputAmount = trade.outputAmount.toSignificant(3)

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
            const withRecipient =
              recipient === account
                ? base
                : `${base} to ${
                    recipientAddressOrName && isAddress(recipientAddressOrName)
                      ? shortenAddress(recipientAddressOrName)
                      : recipientAddressOrName
                  }`

            addTransaction(response, {
              summary: withRecipient
            })

            return response.transaction_hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null
    }
  }, [trade, account, chainId, recipient, recipientAddressOrName, swapCalls, approvalCallback, addTransaction])
}

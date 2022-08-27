import { BigNumber } from '@ethersproject/bignumber'
import { Contract, Args, uint256, RawArgs, stark, Call } from 'starknet'
import {JSBI, LPToken, Percent, Router, SwapParameters as ZapParameters, TokenAmount, Trade, TradeType} from '@jediswap/sdk'
import { useMemo } from 'react'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { useTransactionAdder } from '../state/transactions/hooks'
import { isAddress, shortenAddress } from '../utils'
import { useZapInContract } from './useContract'
import isZero from '../utils/isZero'
import { useActiveStarknetReact } from './index'
import useTransactionDeadline from './useTransactionDeadline'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { computeSlippageAdjustedLPAmount } from '../utils/prices'
import { useApprovalCallFromTrade } from './useApproveCall'
import {Modes} from "../state/zap/actions";
// import useENS from './useENS'

export enum ZapCallbackState {
  INVALID,
  LOADING,
  VALID
}

interface ZapCall {
  contract: Contract
  parameters: ZapParameters
}

interface SuccessfulCall {
  call: ZapCall
  gasEstimate?: BigNumber
}

interface FailedCall {
  call: ZapCall
  error: Error
}

type EstimatedZapCall = SuccessfulCall | FailedCall

/**
 * Returns the zap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useZapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if zap should be returned to sender
): ZapCall[] {
  const { account, chainId, library, connectedAddress } = useActiveStarknetReact()

  // const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? connectedAddress : recipientAddressOrName

  const deadline = useTransactionDeadline()

  const contract: Contract | null = useZapInContract()

  return useMemo(() => {
    if (!trade || !recipient || !library || !account || !chainId || !deadline || !connectedAddress) {
      return []
    }

    if (!contract) {
      return []
    }

    const zapMethods: any[] = []

    zapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        recipient,
        deadline: deadline.toNumber()
      })
    )

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      zapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          recipient,
          deadline: deadline.toNumber()
        })
      )
    }
    return zapMethods.map(parameters => ({ parameters, contract }))
  }, [account, allowedSlippage, chainId, connectedAddress, contract, deadline, library, recipient, trade])
}

// returns a function that will execute a zap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useZapCallback(
  trade: Trade | undefined,
  tokenAmountOut: TokenAmount | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if zap should be returned to sender
): { state: ZapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveStarknetReact()
  const approvalCallback = useApprovalCallFromTrade(trade, allowedSlippage, 'zap')
  const zapCalls = useZapCallArguments(trade, allowedSlippage, recipientAddressOrName)

  const addTransaction = useTransactionAdder()
  const recipient = recipientAddressOrName === null ? account : recipientAddressOrName

  const mode = tokenAmountOut?.token instanceof LPToken ? Modes.IN : Modes.OUT;

  return useMemo(() => {
    if (!trade || !tokenAmountOut || !library || !account || !chainId) {
      return { state: ZapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: ZapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: ZapCallbackState.LOADING, callback: null, error: null }
      }
    }

    const inputToken = wrappedCurrency(trade.inputAmount.currency, chainId)
    const adjustedTokenAmountOut = computeSlippageAdjustedLPAmount(tokenAmountOut, 5000)

    if (!inputToken || !adjustedTokenAmountOut) {
      return { state: ZapCallbackState.INVALID, callback: null, error: 'Input Token Missing' }
    }

    // if (!approvalCall) {
    //   return { state: ZapCallbackState.INVALID, callback: null, error: 'Missing approval call' }
    // }

    return {
      state: ZapCallbackState.VALID,
      callback: async function onZap(): Promise<string> {
        const estimatedCalls: EstimatedZapCall[] = await Promise.all(
          zapCalls.map(call => {
            const {
              parameters: { methodName, args, value },
              contract
            } = call
            const options = !value || isZero(value) ? {} : { value }

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

        const uint256AmountIn = uint256.bnToUint256(amountIn as string)
        const uint256_AdjustedTokenAmountOut = uint256.bnToUint256(adjustedTokenAmountOut?.raw.toString())

        const zapArgs: RawArgs = {
          from_token_address: inputToken.address,
          pair_address: adjustedTokenAmountOut.token.address,
          amount: { type: 'struct', ...uint256AmountIn },
          min_pool_token: { type: 'struct', ...uint256_AdjustedTokenAmountOut },
          path,
          transfer_residual: '0'
        }

        const zapCalldata = stark.compileCalldata(zapArgs)

        const zapCall: Call = {
          contractAddress: contract.address,
          entrypoint: Modes.IN ? 'zap_in' : 'zap_out',
          calldata: zapCalldata
        }

        return account
          .execute([approval, zapCall])
          .then(response => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = adjustedTokenAmountOut.token.symbol
            const inputAmount = trade.inputAmount.toSignificant(3)
            const outputAmount = adjustedTokenAmountOut.toSignificant(3)

            const base = `Zap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
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
            if ((error?.message as string).toLowerCase() === 'user abort') {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Zap failed`, error, methodName, args, value)

              console.log(error?.code)
              throw new Error(`Zap failed: ${error.message}`)
            }
          })
      },
      error: null
    }
  }, [
    trade,
    tokenAmountOut,
    library,
    account,
    chainId,
    recipient,
    recipientAddressOrName,
    zapCalls,
    approvalCallback,
    addTransaction
  ])
}

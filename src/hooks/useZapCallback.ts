import { BigNumber } from '@ethersproject/bignumber'
import { Contract, uint256, RawArgs, stark, Call } from 'starknet'
import { JSBI, Percent, Router, SwapParameters as ZapParameters, TokenAmount, Trade, TradeType } from '@jediswap/sdk'
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

    //
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
  lpAmountOut: TokenAmount | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if zap should be returned to sender
): { state: ZapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveStarknetReact()

  const approvalCallback = useApprovalCallFromTrade(trade, allowedSlippage, 'zap')
  const zapCalls = useZapCallArguments(trade, allowedSlippage, recipientAddressOrName)

  const addTransaction = useTransactionAdder()
  const recipient = recipientAddressOrName === null ? account : recipientAddressOrName

  // const { address: recipientAddress } = useENS(recipientAddressOrName)

  return useMemo(() => {
    if (!trade || !lpAmountOut || !library || !account || !chainId) {
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

    const minLPAmountOut = computeSlippageAdjustedLPAmount(lpAmountOut, 5000)
    // console.log(
    //   '🚀 ~ file: useZapCallback.ts ~ line 127 ~ returnuseMemo ~ minLPAmountOut',
    //   allowedSlippage,
    //   minLPAmountOut?.toSignificant(6)
    // )

    if (!inputToken || !minLPAmountOut) {
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
        const uint256_LP_AmountOut = uint256.bnToUint256(minLPAmountOut?.raw.toString())

        const zapArgs: RawArgs = {
          from_token_address: inputToken.address,
          pair_address: lpAmountOut.token.address,
          amount: { type: 'struct', ...uint256AmountIn },
          min_pool_token: { type: 'struct', ...uint256_LP_AmountOut },
          path,
          transfer_residual: '0'
        }

        const zapCalldata = stark.compileCalldata(zapArgs)

        const zapCall: Call = {
          contractAddress: contract.address,
          entrypoint: 'zap_in',
          calldata: zapCalldata
        }

        return account
          .execute([approval, zapCall])
          .then(response => {
            const inputSymbol = trade.inputAmount.currency.symbol
            const outputSymbol = lpAmountOut.token.symbol
            const inputAmount = trade.inputAmount.toSignificant(3)
            const outputAmount = lpAmountOut.toSignificant(3)

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
    lpAmountOut,
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

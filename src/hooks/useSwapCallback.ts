import { BigNumber } from '@ethersproject/bignumber'
import { Contract, uint256, stark, RawArgs, Call } from 'starknet'
import { JSBI, Percent, Router, SwapParameters, Trade, TradeType } from '@jediswap/sdk'
import { useMemo } from 'react'
import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
import { useTransactionAdder } from '../state/transactions/hooks'
import { isAddress, shortenAddress } from '../utils'
import { useRouterContract } from './useContract'
import isZero from '../utils/isZero'
import { useActiveStarknetReact } from './index'
import useTransactionDeadline from './useTransactionDeadline'
// import useENS from './useENS'
import { useApprovalCallFromTrade } from './useApproveCall'

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
  const { connectedAddress, account, chainId, library } = useActiveStarknetReact()

  // const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? connectedAddress : recipientAddressOrName

  const deadline = useTransactionDeadline()

  const contract: Contract | null = useRouterContract()

  return useMemo(() => {
    if (!trade || !recipient || !library || !account || !chainId || !deadline || !connectedAddress) {
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
  }, [account, allowedSlippage, chainId, connectedAddress, contract, deadline, library, recipient, trade])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveStarknetReact()

  const approvalCallback = useApprovalCallFromTrade(trade, allowedSlippage)
  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)

  const addTransaction = useTransactionAdder()
  const recipient = recipientAddressOrName === null ? account : recipientAddressOrName

  // const { address: recipientAddress } = useENS(recipientAddressOrName)

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    // if (!approvalCall) {
    //   return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing approval call' }
    // }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(
          swapCalls.map(call => {
            const {
              parameters: { methodName, args, value }
            } = call

            return { call }

            // return contract.estimateGas[methodName](...args, options)
            //   .then(gasEstimate => {
            //     return {
            //       call,
            //       gasEstimate
            //     }
            //   })
            //   .catch(gasError => {
            //     console.debug('Gas estimate failed, trying eth_call to extract error', call)

            //     return contract.callStatic[methodName](...args, options)
            //       .then(result => {
            //         console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
            //         return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
            //       })
            //       .catch(callError => {
            //         console.debug('Call threw error', call, callError)
            //         let errorMessage: string
            //         switch (callError.reason) {
            //           case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
            //           case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
            //             errorMessage =
            //               'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
            //             break
            //           default:
            //             errorMessage = `The transaction cannot succeed due to error: ${callError.reason}. This is probably an issue with one of the tokens you are swapping.`
            //         }
            //         return { call, error: new Error(errorMessage) }
            //       })
            //   })
          })
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        // const successfulEstimation = estimatedCalls.find(
        //   (el, ix, list): el is SuccessfulCall =>
        //     'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        // )

        // if (!successfulEstimation) {
        //   const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
        //   if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
        //   throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        // }

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
        const uint256AmountOut = uint256.bnToUint256(amountOut as string)

        const swapArgs: RawArgs = {
          amountIn: { type: 'struct', ...uint256AmountIn },
          amountOutMin: { type: 'struct', ...uint256AmountOut },
          path,
          to,
          deadline
        }

        // const swapCalldata = [...Object.values(uint256AmountIn), ...Object.values(uint256AmountOut), path, to, deadline]

        const swapCalldata = stark.compileCalldata(swapArgs)

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
  }, [trade, library, account, chainId, recipient, recipientAddressOrName, swapCalls, approvalCallback, addTransaction])
}

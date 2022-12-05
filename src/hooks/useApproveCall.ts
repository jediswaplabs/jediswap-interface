import { CurrencyAmount, Token, ETHER, TokenAmount, Trade, WETH } from '@jediswap/sdk'
import { useCallback, useMemo } from 'react'
import { Call, RawArgs, stark, uint256 } from 'starknet'
import { useActiveStarknetReact } from '.'
import { DEFAULT_CHAIN_ID, ROUTER_ADDRESS, ZAP_IN_ADDRESS } from '../constants'
import { Field as SwapField } from '../state/swap/actions'
import { Field as ZapField } from '../state/zap/actions'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { TradeType } from './useApproveCallback'

export function useApprovalCall(amountToApprove?: CurrencyAmount, spender?: string): () => Call | null {
  const { chainId } = useActiveStarknetReact()
  const token: Token | undefined =
    amountToApprove instanceof TokenAmount
      ? amountToApprove.token
      : amountToApprove?.currency === ETHER
      ? WETH[chainId ?? DEFAULT_CHAIN_ID]
      : undefined

  return useCallback(() => {
    if (!token) {
      console.error('no token')
      return null
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return null
    }

    if (!spender) {
      console.error('no spender')
      return null
    }

    const uint256AmountToApprove = uint256.bnToUint256(amountToApprove.raw.toString())

    const approveArgs: RawArgs = {
      spender,
      amount: { type: 'struct', ...uint256AmountToApprove }
    }

    const approveCalldata = stark.compileCalldata(approveArgs)

    const approveCall: Call = {
      contractAddress: token.address,
      entrypoint: 'approve',
      calldata: approveCalldata
    }

    return approveCall
  }, [amountToApprove, spender, token])
}

export function useApprovalCallFromTrade(trade?: Trade, allowedSlippage = 0, tradeType: TradeType = 'swap') {
  const inputField = tradeType === 'swap' ? SwapField.INPUT : ZapField.INPUT
  const { chainId } = useActiveStarknetReact()

  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[inputField] : undefined),
    [trade, allowedSlippage, inputField]
  )

  const spender =
    tradeType === 'zap' ? ZAP_IN_ADDRESS[chainId ?? DEFAULT_CHAIN_ID] : ROUTER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID]

  return useApprovalCall(amountToApprove, spender)
}

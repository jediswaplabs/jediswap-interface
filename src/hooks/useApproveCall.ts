import { CurrencyAmount, Token, TOKEN0, TokenAmount, Trade, WTOKEN0 } from '@jediswap/sdk'
import { useMemo } from 'react'
import { Call, RawArgs, stark, uint256 } from 'starknet'
import { useActiveStarknetReact } from '.'
import { ROUTER_ADDRESS, ZAP_IN_ADDRESS } from '../constants'
import { Field as SwapField } from '../state/swap/actions'
import { Field as ZapField } from '../state/zap/actions'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { TradeType } from './useApproveCallback'

export function useApprovalCall(amountToApprove?: CurrencyAmount, spender?: string) {
  const { chainId } = useActiveStarknetReact()
  const token: Token | undefined =
    amountToApprove instanceof TokenAmount
      ? amountToApprove.token
      : amountToApprove?.currency === TOKEN0
      ? WTOKEN0[chainId ?? 5]
      : undefined

  if (!token) {
    console.error('no token')
    return
  }

  if (!amountToApprove) {
    console.error('missing amount to approve')
    return
  }

  if (!spender) {
    console.error('no spender')
    return
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
}

export function useApprovalCallFromTrade(trade?: Trade, allowedSlippage = 0, tradeType: TradeType = 'swap') {
  const inputField = tradeType === 'swap' ? SwapField.INPUT : ZapField.INPUT

  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[inputField] : undefined),
    [trade, allowedSlippage, inputField]
  )

  const spender = tradeType === 'zap' ? ZAP_IN_ADDRESS : ROUTER_ADDRESS

  return useApprovalCall(amountToApprove, spender)
}

import { INITIAL_ALLOWED_SLIPPAGE } from './../constants/index'
import { BLOCKED_PRICE_IMPACT_NON_EXPERT } from '../constants'
import { CurrencyAmount, Fraction, JSBI, Pair, Percent, Price, TokenAmount, Trade } from '@jediswap/sdk'
import { ALLOWED_PRICE_IMPACT_HIGH, ALLOWED_PRICE_IMPACT_LOW, ALLOWED_PRICE_IMPACT_MEDIUM } from '../constants'
import { Field } from '../state/swap/actions'
import { basisPointsToPercent } from './index'

const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

// computes price breakdown for the trade
export function computeTradePriceBreakdown(
  trade?: Trade
): { priceImpactWithoutFee?: Percent; realizedLPFee?: CurrencyAmount } {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        trade.route.pairs.reduce<Fraction>(
          (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
          ONE_HUNDRED_PERCENT
        )
      )

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
      : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient))

  return { priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount }
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number
): { [field in Field]?: CurrencyAmount } {
  const pct = basisPointsToPercent(allowedSlippage);
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct)
  }
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1
  return 0
}

export function formatExecutionPrice(trade?: Trade, inverted?: boolean, separator = '~'): string {
  if (!trade) {
    return ''
  }

  return inverted
    ? `1 ${trade.outputAmount.currency.symbol} ${separator} ${trade.executionPrice.invert().toSignificant(5)} ${
        trade.inputAmount.currency.symbol
      }`
    : `1 ${trade.inputAmount.currency.symbol} ${separator} ${trade.executionPrice.toSignificant(5)} ${
        trade.outputAmount.currency.symbol
      } `
}

export function formatPairExecutionPrice(pair?: Pair, inverted?: boolean, separator = '~'): string {
  if (!pair) {
    return ''
  }

  return inverted
    ? `1 ${pair.token0.symbol} ${separator} ${pair.priceOf(pair.token0).toSignificant(6)} ${pair.token1.symbol}`
    : `1 ${pair.token1.symbol} ${separator} ${pair.priceOf(pair.token1).toSignificant(6)} ${pair.token0.symbol} `
}

export function formatZapExecutionPrice(
  trade?: Trade,
  lpAmountOut?: TokenAmount,
  inverted?: boolean,
  separator = '~'
): string {
  if (!trade || !lpAmountOut) {
    return ''
  }

  const { inputAmount } = trade

  const zapExecutionPrice = new Price(inputAmount.currency, lpAmountOut.currency, inputAmount.raw, lpAmountOut.raw)

  const lpSymbol = lpAmountOut.currency.symbol?.split('-').join('/')

  return inverted
    ? `1 ${lpSymbol} ${separator} ${zapExecutionPrice.invert().toSignificant(3)} ${trade.inputAmount.currency.symbol}`
    : `1 ${trade.inputAmount.currency.symbol} ${separator} ${zapExecutionPrice.toSignificant(3)} ${lpSymbol} `
}

export function computeSlippageAdjustedLPAmount(
  lpTokenAmount: TokenAmount | undefined,
  slippageTolerance: number = INITIAL_ALLOWED_SLIPPAGE
) {
  if (!lpTokenAmount) return

  const slippagePercent = basisPointsToPercent(slippageTolerance)

  const slippageAdjustedAmountOut = new Fraction(JSBI.BigInt(1))
    .add(slippagePercent)
    .invert()
    .multiply(lpTokenAmount.raw).quotient

  return new TokenAmount(lpTokenAmount.token, slippageAdjustedAmountOut)
}

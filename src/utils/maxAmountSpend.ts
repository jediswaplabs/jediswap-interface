import { CurrencyAmount, TOKEN0, JSBI } from '@jediswap/sdk'
import { MIN_ETH } from '../constants'

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(currencyAmount?: CurrencyAmount): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency === TOKEN0) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
      return CurrencyAmount.token0(JSBI.subtract(currencyAmount.raw, MIN_ETH))
    } else {
      return CurrencyAmount.token0(JSBI.BigInt(0))
    }
  }
  return currencyAmount
}

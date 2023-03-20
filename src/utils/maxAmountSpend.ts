import { CurrencyAmount, ETHER, JSBI } from '@jediswap/sdk'
import { MIN_ETH } from '../constants'

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 * This function can be used in future to ensure that user don't spend all the baseToken
 * for a trade
 * Let's keep it around for that reason
 */

/*
 export function maxAmountSpend(currencyAmount?: CurrencyAmount): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency === ETHER) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
      return CurrencyAmount.token0(JSBI.subtract(currencyAmount.raw, MIN_ETH))
    } else {
      return CurrencyAmount.token0(JSBI.BigInt(0))
    }
  }
  return currencyAmount
} */

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 *
 * This is the Jediswap version of the above function
 * We are not deducting any amount from the maxAmount
 * even if the currency is a BaseToken(token0).
 * This might not be useful after Starknet implements a fee mechanism
 */
export function maxAmountSpend(currencyAmount?: CurrencyAmount): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  return currencyAmount
}

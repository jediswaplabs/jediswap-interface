import { Currency, ETHER, Token, WETH } from '@jediswap/sdk'
// import { ETHER } from '../constants'

export function currencyId(currency: Currency): string {
  if (currency === ETHER) return 'ETH'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}

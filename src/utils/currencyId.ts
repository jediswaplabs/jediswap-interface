import { Currency, TOKEN0, Token, WTOKEN0 } from '@jediswap/sdk'
// import { TOKEN0 } from '../constants'

export function currencyId(currency: Currency): string {
  if (currency === TOKEN0) return 'TOKEN0'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}

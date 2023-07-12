import { Currency, CurrencyAmount, ETHER, Token, TokenAmount, WETH } from '@jediswap/sdk'
import { starknetChainId } from '../constants'

export function wrappedCurrency(
  currency: Currency | undefined,
  chainId: starknetChainId | undefined
): Token | undefined {
  return chainId && currency === ETHER ? WETH[chainId] : currency instanceof Token ? currency : undefined
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: starknetChainId | undefined
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function unwrappedToken(token: Token): Currency {
  if (token.equals(WETH[token.chainId])) return ETHER
  return token
}

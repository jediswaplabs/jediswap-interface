import { Token } from '@jediswap/sdk'
import { WrappedTokenInfo } from '../state/lists/hooks'

export function wrapToken(token) {
  if (!token) {
    return
  }
  if (token.tokenInfo) {
    return new WrappedTokenInfo(token.tokenInfo, token.tags)
  }
  return new Token(token.chainId, token.address, token.decimals, token.symbol, token.name, token.logoURI)
}

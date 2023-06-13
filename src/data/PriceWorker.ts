import { Pair } from '@jediswap/sdk'
import { validateAndParseAddress } from 'starknet'

import { wrapToken } from '../utils/wrapToken'

onmessage = e => {
  const { tokens, chainId } = e.data
  const tokensNew = tokens.map(([tokenA, tokenB]) => {
    return [wrapToken(tokenA), wrapToken(tokenB)]
  })

  const pairAddresses = tokensNew.map(([tokenA, tokenB]) => {
    return tokenA && tokenB && !tokenA.equals(tokenB)
      ? validateAndParseAddress(Pair.getAddress(tokenA, tokenB))
      : undefined
  })
  postMessage({ pairAddresses, tokens: tokensNew })
}

import { TokenAmount, Pair, Currency, JSBI, Token } from '@jediswap/sdk'
import { useMemo } from 'react'
import JediswapPairABI from '../constants/abis/Pair.json'
import { Interface } from '@ethersproject/abi'
import { useActiveStarknetReact } from '../hooks'

import { wrappedCurrency } from '../utils/wrappedCurrency'
import { Abi, validateAndParseAddress } from 'starknet'
import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { useAllPairs } from '../state/pairs/hooks'

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

export interface LiquidityPairToken {
  liquidityToken: Token | undefined
  tokens: [Token, Token]
}

export function usePairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const { chainId } = useActiveStarknetReact()
  const allPairs = useAllPairs()

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId)
      ]),
    [chainId, currencies]
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB)
          ? validateAndParseAddress(Pair.getAddress(tokenA, tokenB))
          : undefined
      }),
    [tokens]
  )

  const validatedPairAddress = useMemo(
    () => pairAddresses.map(addr => (addr && allPairs.includes(addr) ? addr : undefined)),
    [allPairs, pairAddresses]
  )

  const results = useMultipleContractSingleData(validatedPairAddress, JediswapPairABI as Abi, 'get_reserves')

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens?.[i]?.[0]
      const tokenB = tokens?.[i]?.[1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves

      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

      // const reserve0Amount = JSBI.BigInt(uint256.uint256ToBN(reserve0 as any).toString())
      // const reserve1Amount = JSBI.BigInt(uint256.uint256ToBN(reserve1 as any).toString())

      return [
        PairState.EXISTS,
        new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString()))
      ]
    })
  }, [results, tokens])
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  const pairs = usePairs([[tokenA, tokenB]])?.[0]
  return pairs ?? [PairState.LOADING, null]
}

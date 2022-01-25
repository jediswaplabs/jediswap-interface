import { TokenAmount, Pair, Currency, JSBI } from '@jediswap/sdk'
import { useMemo } from 'react'
import JediswapPairABI from '../constants/abis/Pair.json'
import { Interface } from '@ethersproject/abi'
import { useActiveStarknetReact } from '../hooks'
import { useMultipleStarknetCallSingleData } from '../hooks/useStarknet'

import { wrappedCurrency } from '../utils/wrappedCurrency'
import { Abi, uint256 } from '@jediswap/starknet'
import { usePairAddresses } from '../hooks/usePairAddress'

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

export function usePairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const { chainId } = useActiveStarknetReact()

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId)
      ]),
    [chainId, currencies]
  )
  // console.log('🚀 ~ file: Reserves.ts ~ line 32 ~ usePairs ~ tokens', tokens, currencies)

  const pairAddresses = usePairAddresses(tokens)
  // console.log('🚀 ~ file: Reserves.ts ~ line 34 ~ usePairs ~ pairAddresses', pairAddresses)

  // const pairAddresses = useMemo(
  //   () =>
  //     tokens.map(([tokenA, tokenB]) => {
  //       return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
  //     }),
  //   [tokens]
  // )

  const results = useMultipleStarknetCallSingleData(pairAddresses, JediswapPairABI as Abi[], 'get_reserves')
  // console.log('🚀 ~ file: Reserves.ts ~ line 44 ~ usePairs ~ results', results)

  return useMemo(() => {
    return results.map((reserves, i) => {
      // const { result: reserves, loading } = result
      const tokenA = tokens?.[i]?.[0]
      const tokenB = tokens?.[i]?.[1]

      // if (!r) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

      const reserve0Amount = JSBI.BigInt(uint256.uint256ToBN(reserve0 as any).toString())
      const reserve1Amount = JSBI.BigInt(uint256.uint256ToBN(reserve1 as any).toString())

      return [
        PairState.EXISTS,
        new Pair(
          new TokenAmount(token0, reserve0Amount.toString()),
          new TokenAmount(token1, reserve1Amount.toString()),
          pairAddresses[i]
        )
      ]
    })
  }, [results, tokens])
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]])[0]
}

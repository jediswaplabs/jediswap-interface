import { useStarknetCall, NEVER_RELOAD } from './useStarknet'
import { useMemo, useState, useCallback, useEffect } from 'react'
import { Token } from '@jediswap/sdk'
import { useRegistryContract } from './useContract'
import { useBlockNumber } from '../state/application/hooks'
import { Args } from 'starknet'
import useDeepCompareEffect from 'use-deep-compare-effect'
import { retry } from '../utils/retry'

/**
 * Fetches Pair Address for given tokens from the registry.
 * This is a substitute for deterministic (Create2) Pair addresses implemented
 * in Uniswap using ethers.js .
 *
 * Will be deprecated once getContractAddress is implemented by Starknet
 * @param tokens
 * @returns (string | undefined)[]
 */
export function usePairAddresses(tokens: (Token | undefined)[][]): (string | undefined)[] {
  const registryContract = useRegistryContract()
  const blockNumber = useBlockNumber()
  const [calls, setCalls] = useState<(Args | undefined)[]>([])

  const callResults = useCallback(
    (tokens: (Token | undefined)[][]) => {
      return Promise.all(
        tokens.map(([tokenA, tokenB]) => {
          if (!tokenA || !tokenB || tokenA.equals(tokenB)) return undefined
          else {
            return registryContract?.call('get_pair_for', { token0: tokenA.address, token1: tokenB.address })
          }
          // if (addresses && contractInterface && methodName) {
          //   const contract = new Contract(contractInterface, address)

          //   return contract?.call(methodName, args)
          // }
        })
      )
    },
    [registryContract, tokens]
  )

  useDeepCompareEffect(() => {
    let isCancelled = false

    if (!registryContract || !tokens) return

    if (!isCancelled) {
      const { promise, cancel } = retry(() => callResults(tokens), {
        n: Infinity,
        minWait: 2500,
        maxWait: 3500
      })

      promise.then(call => setCalls(call)).catch(error => console.error('Error in: ', error))
    }

    return () => {
      isCancelled = true
    }
  }, [blockNumber, tokens, callResults, registryContract])

  return useMemo(() => {
    const fetchedPairs = calls.map(call => call?.pair as string)

    return [...new Set(fetchedPairs)]
  }, [calls])
}

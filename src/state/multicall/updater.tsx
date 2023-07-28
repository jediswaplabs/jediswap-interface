import { Contract, FunctionAbi, number, hash, uint256 } from 'starknet'
import { toBN } from 'starknet/dist/utils/number'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMulticallContract } from '../../hooks/useContract'
import useDebounce from '../../hooks/useDebounce'
import chunkArray from '../../utils/chunkArray'
import { CancelledError, retry, RetryableError } from '../../utils/retry'
import { AppDispatch, AppState } from '../index'
import {
  Call,
  errorFetchingMulticallResults,
  fetchingMulticallResults,
  parseCallKey,
  updateMulticallResults
} from './actions'
import BN from 'bn.js'

import { StarknetChainId } from 'starknet/dist/constants'
import { useBlockNumber } from '../application/hooks'
import { useAccountDetails } from '../../hooks'

// chunk calls so we do not exceed the gas limit
const CALL_CHUNK_SIZE = 500

/**
 * Fetches a chunk of calls, enforcing a minimum block number constraint
 * @param multicallContract multicall contract to fetch against
 * @param chunk chunk of calls to make
 * @param minBlockNumber minimum block number of the result set
 */
async function fetchChunk(
  multicallContract: Contract,
  chunk: Call[],
  minBlockNumber: number
): Promise<{ results: BN[]; blockNumber: number }> {
  console.debug('Fetching chunk', multicallContract, chunk, minBlockNumber)
  let resultsBlockNumber, returnData_len, returnData

  const { getSelectorFromName } = hash

  try {
    const calls = chunk.flatMap(obj => [
      obj.address,
      getSelectorFromName(obj.methodName),
      obj.calldata_len,
      ...obj.calldata
    ])

    // Keep it here for multicall debugging
    const dateTime = new Date().getTime()
    const response = await multicallContract.aggregate(calls)

    resultsBlockNumber = response.block_number
    returnData_len = response.result_len
    returnData = response.result
  } catch (error) {
    console.debug('Failed to fetch chunk inside retry', error)
    throw error
  }
  if (toBN(resultsBlockNumber).toNumber() < minBlockNumber) {
    console.debug(`Fetched results for old block number: ${resultsBlockNumber.toString()} vs. ${minBlockNumber}`)
    throw new RetryableError('Fetched for old block number')
  }
  return { results: returnData, blockNumber: toBN(resultsBlockNumber).toNumber() }
}

/**
 * From the current all listeners state, return each call key mapped to the
 * minimum number of blocks per fetch. This is how often each key must be fetched.
 * @param allListeners the all listeners state
 * @param chainId the current chain id
 */
export function activeListeningKeys(
  allListeners: AppState['multicall']['callListeners'],
  chainId?: StarknetChainId
): { [callKey: string]: number } {
  if (!allListeners || !chainId) return {}
  const listeners = allListeners[chainId]
  if (!listeners) return {}

  return Object.keys(listeners).reduce<{ [callKey: string]: number }>((memo, callKey) => {
    const keyListeners = listeners[callKey]

    memo[callKey] = Object.keys(keyListeners)
      .filter(key => {
        const blocksPerFetch = parseInt(key)
        if (blocksPerFetch <= 0) return false
        return keyListeners[blocksPerFetch] > 0
      })
      .reduce((previousMin, current) => {
        return Math.min(previousMin, parseInt(current))
      }, Infinity)
    return memo
  }, {})
}

/**
 * Return the keys that need to be refetched
 * @param callResults current call result state
 * @param listeningKeys each call key mapped to how old the data can be in blocks
 * @param chainId the current chain id
 * @param latestBlockNumber the latest block number
 */
export function outdatedListeningKeys(
  callResults: AppState['multicall']['callResults'],
  listeningKeys: { [callKey: string]: number },
  chainId: StarknetChainId | undefined,
  latestBlockNumber: number | undefined
): string[] {
  if (!chainId || !latestBlockNumber) return []
  const results = callResults[chainId]
  // no results at all, load everything
  if (!results) return Object.keys(listeningKeys)

  return Object.keys(listeningKeys).filter(callKey => {
    const blocksPerFetch = listeningKeys[callKey]

    const data = callResults[chainId][callKey]
    // no data, must fetch
    if (!data) return true

    const minDataBlockNumber = latestBlockNumber - (blocksPerFetch - 1)

    // already fetching it for a recent enough block, don't refetch it
    if (data.fetchingBlockNumber && data.fetchingBlockNumber >= minDataBlockNumber) return false

    // if data is older than minDataBlockNumber, fetch it
    return !data.blockNumber || data.blockNumber < minDataBlockNumber
  })
}

export function parseReturnData(
  currentIndex: number,
  returnData: string[],
  returnDataIterator: IterableIterator<string>,
  contractInterface?: FunctionAbi
): string {
  if (contractInterface) {
    const numberOfOutputs = contractInterface.outputs.length
    const hasMultipleOutputs = numberOfOutputs > 1
    const hasUint256Output = contractInterface.outputs.some(o => o.type === 'Uint256')
    const hasArrayOutput = contractInterface.outputs.some(o => /_len$/.test(o.name))

    if (hasMultipleOutputs) {
      const outputAbiEntries = contractInterface.outputs

      if (!hasUint256Output) {
        // If output is not of type uint256, no. of results = no. of calls * no. of outputs

        const parsedReturnData = outputAbiEntries.reduce<{ [outputName: string]: string }>((memo, entry, i) => {
          if (hasArrayOutput && memo[`${entry.name}_len`]) {
            const len = parseInt(memo[`${entry.name}_len`], 16)
            const arr: string[] = []

            while (arr.length < len) {
              const data = returnDataIterator.next().value
              arr.push(data)
            }

            delete memo[`${entry.name}_len`]

            return {
              ...memo,
              [entry.name]: arr
            }
          }

          return {
            ...memo,
            [entry.name]: returnDataIterator.next().value
          }
        }, {})

        return JSON.stringify(parsedReturnData)
      } else {
        // Multiple outputs are of type uint256, no. of results = no. of calls * no. of outputs * 2

        const parsedReturnData = outputAbiEntries.reduce<{ [outputName: string]: string }>((memo, entry, i) => {
          if (entry.type === 'Uint256') {
            const returnDataLow = returnDataIterator.next().value
            const returnDataHigh = returnDataIterator.next().value

            const uint256ReturnData: uint256.Uint256 = { low: returnDataLow, high: returnDataHigh }

            return {
              ...memo,
              [entry.name]: number.toHex(uint256.uint256ToBN(uint256ReturnData))
            }
          } else {
            return {
              ...memo,
              [entry.name]: returnDataIterator.next().value
            }
          }
        }, {})

        return JSON.stringify(parsedReturnData)
      }
    } else {
      // Has Single Output
      if (!hasUint256Output) {
        // Single Output and no uint256, no. of results = no. of calls

        // return returnData[currentIndex]
        return returnDataIterator.next().value
      } else {
        // Single Output of type uint256, no. of results = no. of calls * 2
        // const uint256Result: uint256.Uint256 = {
        //   low: returnData[currentIndex * 2],
        //   high: returnData[currentIndex * 2 + 1]
        // }

        const uint256Result: uint256.Uint256 = {
          low: returnDataIterator.next().value,
          high: returnDataIterator.next().value
        }

        const parsedReturnData = number.toHex(uint256.uint256ToBN(uint256Result))

        return parsedReturnData
      }
    }
  }
  return returnDataIterator.next().value
}

export default function Updater(): null {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['multicall']>(state => state.multicall)
  // wait for listeners to settle before triggering updates
  const debouncedListeners = useDebounce(state.callListeners, 100)
  const latestBlockNumber = useBlockNumber()
  const { account, chainId } = useAccountDetails()
  const multicallContract = useMulticallContract()
  const cancellations = useRef<{ blockNumber: number; cancellations: (() => void)[] }>()

  const listeningKeys: { [callKey: string]: number } = useMemo(() => {
    return activeListeningKeys(debouncedListeners, chainId)
  }, [debouncedListeners, chainId])

  const unserializedOutdatedCallKeys = useMemo(() => {
    return outdatedListeningKeys(state.callResults, listeningKeys, chainId, latestBlockNumber)
  }, [chainId, state.callResults, listeningKeys, latestBlockNumber])

  const serializedOutdatedCallKeys = useMemo(() => JSON.stringify(unserializedOutdatedCallKeys.sort()), [
    unserializedOutdatedCallKeys
  ])

  useEffect(() => {
    if (!latestBlockNumber || !chainId || !multicallContract) return

    const outdatedCallKeys: string[] = JSON.parse(serializedOutdatedCallKeys)
    if (outdatedCallKeys.length === 0) return
    const calls = outdatedCallKeys.map(key => parseCallKey(key))

    const chunkedCalls = chunkArray(calls, CALL_CHUNK_SIZE)

    if (cancellations.current?.blockNumber !== latestBlockNumber) {
      cancellations.current?.cancellations?.forEach(c => c())
    }

    dispatch(
      fetchingMulticallResults({
        calls,
        chainId,
        fetchingBlockNumber: latestBlockNumber
      })
    )

    cancellations.current = {
      blockNumber: latestBlockNumber,
      cancellations: chunkedCalls.map((chunk, index) => {
        const { cancel, promise } = retry(() => fetchChunk(multicallContract, chunk, latestBlockNumber), {
          n: Infinity,
          minWait: 2500,
          maxWait: 3500
        })
        promise
          .then(({ results: returnData, blockNumber: fetchBlockNumber }) => {
            cancellations.current = { cancellations: [], blockNumber: latestBlockNumber }
            // accumulates the length of all previous indices
            const firstCallKeyIndex = chunkedCalls.slice(0, index).reduce<number>((memo, curr) => memo + curr.length, 0)

            const lastCallKeyIndex = firstCallKeyIndex + returnData.length

            const uint256ReturnData: Array<string> = []

            const bnToHexArray = returnData.map(data => number.toHex(data))

            const returnDataIterator = bnToHexArray.flat()[Symbol.iterator]()

            dispatch(
              updateMulticallResults({
                chainId,
                results: outdatedCallKeys
                  .slice(firstCallKeyIndex, lastCallKeyIndex)
                  .reduce<{ [callKey: string]: string | null }>((memo, callKey, i) => {
                    const methodAbi = debouncedListeners?.[chainId]?.[callKey]?.methodAbi

                    const parsedReturnData: string = parseReturnData(i, bnToHexArray, returnDataIterator, methodAbi)

                    memo[callKey] = parsedReturnData

                    return memo
                  }, {}),
                blockNumber: fetchBlockNumber
              })
            )
          })
          .catch((error: any) => {
            if (error instanceof CancelledError) {
              console.debug('Cancelled fetch for blockNumber', latestBlockNumber)
              return
            }
            console.error('Failed to fetch multicall chunk', chunk, chainId, error)
            dispatch(
              errorFetchingMulticallResults({
                calls: chunk,
                chainId,
                fetchingBlockNumber: latestBlockNumber
              })
            )
          })
        return cancel
      })
    }
  }, [chainId, multicallContract, dispatch, serializedOutdatedCallKeys, latestBlockNumber, debouncedListeners])

  return null
}

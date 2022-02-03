import { Contract, FunctionAbi, number, stark, uint256 } from '@jediswap/starknet'
import { toBN } from '@jediswap/starknet/dist/utils/number'
import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveStarknetReact } from '../../hooks'
import { useMulticallContract } from '../../hooks/useContract'
import useDebounce from '../../hooks/useDebounce'
import chunkArray from '../../utils/chunkArray'
import { CancelledError, retry, RetryableError } from '../../utils/retry'
import { useBlockNumber } from '../application/hooks'
import { AppDispatch, AppState } from '../index'
import {
  Call,
  errorFetchingMulticallResults,
  fetchingMulticallResults,
  parseCallKey,
  updateMulticallResults
} from './actions'

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
): Promise<{ results: string[]; blockNumber: number }> {
  console.debug('Fetching chunk', multicallContract, chunk, minBlockNumber)
  let resultsBlockNumber, returnData_len, returnData
  try {
    const calls = chunk.flatMap(obj => [obj.address, obj.selector, obj.calldata_len, ...obj.calldata])
    console.log('🚀 ~ file: updater.tsx ~ line 37 ~ calls', calls)
    const response = await multicallContract.call('aggregate', { calls })
    console.log('🚀 ~ file: updater.tsx ~ line 38 ~ response', response)

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
  chainId?: number
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
  chainId: number | undefined,
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
  contractInterface: FunctionAbi
): string {
  const numberOfOutputs = contractInterface.outputs.length
  const hasMultipleOutputs = numberOfOutputs > 1
  const hasUint256Output = contractInterface.outputs.some(o => o.type === 'Uint256')
  // const parsedReturnData: Array<string> = [...returnData]

  if (hasMultipleOutputs) {
    const outputAbiEntries = contractInterface.outputs

    if (!hasUint256Output) {
      // If output is not of type uint256, no. of results = no. of calls * no. of outputs
      const parsedReturnData = outputAbiEntries.reduce<{ [outputName: string]: string }>((memo, entry, i) => {
        return {
          ...memo,
          [entry.name]: returnDataIterator.next().value
        }
      }, {})

      return JSON.stringify(parsedReturnData)
    } else {
      // Multiple outputs are of type uint256, no. of results = no. of calls * no. of outputs * 2

      // const uint256ReturnData: uint256.Uint256 = {  }
      const parsedReturnData = outputAbiEntries.reduce<{ [outputName: string]: string }>((memo, entry, i) => {
        const returnDataLow = returnDataIterator.next().value
        const returnDataHigh = returnDataIterator.next().value

        const uint256ReturnData: uint256.Uint256 = { low: returnDataLow, high: returnDataHigh }

        return {
          ...memo,
          [entry.name]: number.toHex(uint256.uint256ToBN(uint256ReturnData))
        }
      }, {})

      return JSON.stringify(parsedReturnData)
    }
  } else {
    // Has Single Output
    if (!hasUint256Output) {
      // Single Output and no uint256, no. of results = no. of calls
      return returnData[currentIndex]
    } else {
      // Single Output of type uint256, no. of results = no. of calls * 2
      const uint256Result: uint256.Uint256 = {
        low: returnData[currentIndex * 2],
        high: returnData[currentIndex * 2 + 1]
      }

      const parsedReturnData = number.toHex(uint256.uint256ToBN(uint256Result))

      return parsedReturnData
    }
  }
  return returnData[currentIndex]
}

export default function Updater(): null {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['multicall']>(state => state.multicall)
  // wait for listeners to settle before triggering updates
  const debouncedListeners = useDebounce(state.callListeners, 100)
  const latestBlockNumber = useBlockNumber()
  const { chainId } = useActiveStarknetReact()
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
    console.log('🚀 ~ file: updater.tsx ~ line 149 ~ useEffect ~ calls', calls)

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
            console.log('🚀 ~ file: updater.tsx ~ line 179 ~ .then ~ firstCallKeyIndex', firstCallKeyIndex)
            const lastCallKeyIndex = firstCallKeyIndex + returnData.length
            console.log('🚀 ~ file: updater.tsx ~ line 181 ~ .then ~ lastCallKeyIndex', lastCallKeyIndex)

            console.log(
              '🚀 ~ file: updater.tsx ~ line 206 ~ .then ~ outdatedCallKeys',
              outdatedCallKeys.slice(firstCallKeyIndex, lastCallKeyIndex)
            )

            const uint256ReturnData: Array<string> = []
            const returnDataIterator = returnData.flat()[Symbol.iterator]()

            dispatch(
              updateMulticallResults({
                chainId,
                results: outdatedCallKeys
                  .slice(firstCallKeyIndex, lastCallKeyIndex)
                  .reduce<{ [callKey: string]: string | null }>((memo, callKey, i) => {
                    const contractAbi = debouncedListeners?.[chainId]?.[callKey]?.contractInterface
                    const methodAbi = contractAbi?.find(
                      member => stark.getSelectorFromName(member.name) === parseCallKey(callKey).selector
                    )

                    // console.log('🚀 ~ file: updater.tsx ~ line 192 ~ .then ~ contractAbi')

                    const parsedReturnData: string = parseReturnData(
                      i,
                      returnData,
                      returnDataIterator,
                      methodAbi as FunctionAbi
                    )
                    console.log('🚀 ~ file: updater.tsx ~ line 272 ~ .then ~ parsedReturnData', parsedReturnData)

                    // if (hasUint256) {
                    //   const parsedReturnData: uint256.Uint256 = { low: returnData[i * 2], high: returnData[i * 2 + 1] }
                    //   // console.log('🚀 ~ file: updater.tsx ~ line 206 ~ .then ~ parsedReturnData', parsedReturnData)
                    //   uint256ReturnData.push(number.toHex(uint256.uint256ToBN(parsedReturnData)))
                    //   console.log('🚀 ~ file: updater.tsx ~ line 216 ~ .then ~ uint256ReturnData[i]', uint256ReturnData)

                    //   memo[callKey] = uint256ReturnData[i]
                    // } else {
                    //   memo[callKey] = returnData[i] ?? null
                    // }
                    memo[callKey] = parsedReturnData
                    console.log('🚀 ~ file: updater.tsx ~ line 214 ~ .then ~ memo', memo)

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

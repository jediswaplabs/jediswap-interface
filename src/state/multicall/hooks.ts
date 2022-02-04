import { FunctionAbi } from './../../../node_modules/@jediswap/sdk/node_modules/@jediswap/starknet/src/types'
import { Abi, Args, compileCalldata, number, validateAndParseAddress } from '@jediswap/starknet'
// import { Interface, FunctionFragment } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
// import { Contract } from '@ethersproject/contracts'
import { Contract, stark } from '@jediswap/starknet'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveStarknetReact } from '../../hooks'
import { useBlockNumber } from '../application/hooks'
import { AppDispatch, AppState } from '../index'
import {
  addMulticallListeners,
  Call,
  removeMulticallListeners,
  parseCallKey,
  toCallKey,
  ListenerOptions
} from './actions'
import { computeCallDataProps } from './utils'
import { isAddress } from '../../utils'

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any
}

type MethodArg = string | number | BigNumber
type MethodArgs = Array<MethodArg | MethodArg[]>

type OptionalMethodInputs = Array<MethodArg | MethodArg[] | undefined> | undefined

function isMethodArg(x: unknown): x is MethodArg {
  return ['string', 'number'].indexOf(typeof x) !== -1
}

function isValidMethodArgs(x: unknown): x is MethodArgs | undefined {
  return (
    x === undefined ||
    (Array.isArray(x) && x.every(xi => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg)))) ||
    (typeof x === 'object' && x !== null && Object.keys(x).length > 0 && Object.values(x).every(xi => xi !== ''))
  )
}

interface CallResult {
  readonly valid: boolean
  readonly data: string | undefined
  readonly blockNumber: number | undefined
}

const INVALID_RESULT: CallResult = { valid: false, blockNumber: undefined, data: undefined }

// use this options object
export const NEVER_RELOAD: ListenerOptions = {
  blocksPerFetch: Infinity
}

// the lowest level call for subscribing to contract data
function useCallsData(calls: (Call | undefined)[], methodAbi?: FunctionAbi, options?: ListenerOptions): CallResult[] {
  console.log('🚀 ~ file: hooks.ts ~ line 57 ~ useCallsData ~ calls', calls)
  const { chainId } = useActiveStarknetReact()
  const callResults = useSelector<AppState, AppState['multicall']['callResults']>(state => state.multicall.callResults)
  const dispatch = useDispatch<AppDispatch>()

  const serializedCallKeys: string = useMemo(
    () =>
      JSON.stringify(
        calls
          ?.filter((c): c is Call => Boolean(c))
          ?.map(toCallKey)
          ?.sort() ?? []
      ),
    [calls]
  )

  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKeys: string[] = JSON.parse(serializedCallKeys)
    if (!chainId || callKeys.length === 0) return undefined
    const calls = callKeys.map(key => parseCallKey(key))
    console.log('🚀 ~ file: hooks.ts ~ line 77 ~ useEffect ~ calls', serializedCallKeys)
    dispatch(
      addMulticallListeners({
        chainId,
        calls,
        options,
        methodAbi
      })
    )

    return () => {
      dispatch(
        removeMulticallListeners({
          chainId,
          calls,
          options
        })
      )
    }
  }, [chainId, dispatch, methodAbi, options, serializedCallKeys])

  return useMemo(
    () =>
      calls.map<CallResult>(call => {
        if (!chainId || !call) return INVALID_RESULT

        const result = callResults[chainId]?.[toCallKey(call)]
        let data
        if (result?.data && result?.data !== '0x') {
          // if (number.isHex(result.data)) {
          //   data = result.data
          // } else {
          //   data = JSON.parse(result.data)
          // }
          data = result.data
        }

        return { valid: true, data, blockNumber: result?.blockNumber }
      }),
    [callResults, calls, chainId]
  )
}

interface CallState {
  readonly valid: boolean
  // the result, or undefined if loading or errored/no data
  readonly result: Result | undefined
  // true if the result has never been fetched
  readonly loading: boolean
  // true if the result is not for the latest block
  readonly syncing: boolean
  // true if the call was made and is synced, but the return data is invalid
  readonly error: boolean
}

const INVALID_CALL_STATE: CallState = { valid: false, result: undefined, loading: false, syncing: false, error: false }
const LOADING_CALL_STATE: CallState = { valid: true, result: undefined, loading: true, syncing: true, error: false }

function toCallState(
  callResult: CallResult | undefined,
  // contractInterface: Interface | undefined,
  // fragment: FunctionFragment | undefined,
  latestBlockNumber: number | undefined
): CallState {
  if (!callResult) return INVALID_CALL_STATE
  const { valid, data, blockNumber } = callResult
  console.log('🚀 ~ file: hooks.ts ~ line 143 ~ data', data)
  if (!valid) return INVALID_CALL_STATE
  if (valid && !blockNumber) return LOADING_CALL_STATE
  if (!latestBlockNumber) return LOADING_CALL_STATE
  const success = data && data.length > 2
  console.log('🚀 ~ file: hooks.ts ~ line 149 ~ success', success)
  const syncing = (blockNumber ?? 0) < latestBlockNumber
  let result: Result | undefined = undefined
  if (success && data) {
    try {
      result = number.isHex(data) ? [data] : JSON.parse(data)
    } catch (error) {
      console.debug('Result data parsing failed', data)
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result
      }
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result: result,
    error: !success
  }
}

export function useSingleContractMultipleData(
  contract: Contract | null | undefined,
  methodName: string,
  callInputs: (Args | undefined)[],
  options?: ListenerOptions
): CallState[] {
  // const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [contract, methodName])
  // const selector = useMemo(() => stark.getSelectorFromName(methodName), [methodName])

  const calls = useMemo(
    () =>
      contract && isAddress(contract.connectedTo) && methodName && callInputs && callInputs.length > 0
        ? callInputs.map<Call>(inputs => {
            const { calldata_len, calldata } = computeCallDataProps(inputs)

            return {
              address: validateAndParseAddress(contract.connectedTo),
              methodName,
              calldata_len: calldata_len.toString(),
              calldata
            }
          })
        : [],
    [callInputs, contract, methodName]
  )
  const methodAbi = useValidatedMethodAbi(contract?.abi, methodName)

  const results = useCallsData(calls, methodAbi, options)

  const latestBlockNumber = useBlockNumber()

  return useMemo(() => {
    return results.map(result => toCallState(result, latestBlockNumber))
  }, [results, latestBlockNumber])
}

export function useMultipleContractSingleData(
  addresses: (string | undefined)[],
  contractInterface: Abi[] | undefined,
  methodName: string,
  callInputs?: Args,
  options?: ListenerOptions
): CallState[] {
  const selector = useMemo(() => stark.getSelectorFromName(methodName), [methodName])
  const callDataProps = useMemo(() => computeCallDataProps(callInputs), [callInputs])

  const callDataLength = callDataProps?.calldata_len.toString()
  const callData = callDataProps?.calldata
  console.log('🚀 ~ file: hooks.ts ~ line 213 ~ callData', callData)

  const calls = useMemo(
    () =>
      addresses && addresses.length > 0 && selector && isValidMethodArgs(callInputs)
        ? addresses.map<Call | undefined>(address => {
            return address && isAddress(address)
              ? {
                  address: validateAndParseAddress(address),
                  methodName,
                  calldata_len: callDataLength,
                  calldata: callData
                }
              : undefined
          })
        : [],
    [addresses, callData, callDataLength, callInputs, methodName, selector]
  )
  console.log('🚀 ~ file: hooks.ts ~ line 231 ~ calls', calls)

  const methodAbi = useValidatedMethodAbi(contractInterface, methodName)

  const results = useCallsData(calls, methodAbi, options)
  console.log('🚀 ~ file: hooks.ts ~ line 233 ~ results', results)

  const latestBlockNumber = useBlockNumber()

  return useMemo(() => {
    return results.map(result => toCallState(result, latestBlockNumber))
  }, [results, latestBlockNumber])
}

export function useSingleCallResult(
  contract: Contract | null | undefined,
  methodName: string,
  inputs?: Args,
  options?: ListenerOptions
): CallState {
  //   const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [contract, methodName])

  const selector = useMemo(() => stark.getSelectorFromName(methodName), [methodName])
  const { calldata_len, calldata } = useMemo(() => computeCallDataProps(inputs), [inputs])
  console.log('🚀 ~ file: hooks.ts ~ line 245 ~ calldata', calldata)
  console.log('🚀 ~ file: hooks.ts ~ line 248 ~ isValidMethodArgs(inputs)', methodName, isValidMethodArgs(inputs))

  const calls = useMemo<Call[]>(() => {
    return contract && isAddress(contract.connectedTo) && selector && isValidMethodArgs(inputs)
      ? [
          {
            address: validateAndParseAddress(contract.connectedTo),
            methodName,
            calldata_len: calldata_len.toString(),
            calldata
          }
        ]
      : []
  }, [calldata, calldata_len, contract, inputs, methodName, selector])
  console.log('🚀 ~ file: hooks.ts ~ line 260 ~ calls', calls)

  const methodAbi = useValidatedMethodAbi(contract?.abi, methodName)

  const result = useCallsData(calls, methodAbi, options)[0]
  console.log('🚀 ~ file: hooks.ts ~ line 259 ~ result', result)
  const latestBlockNumber = useBlockNumber()

  return useMemo(() => {
    return toCallState(result, latestBlockNumber)
  }, [result, latestBlockNumber])
}

export function useValidatedMethodAbi(contractAbi: Abi[] | undefined, methodName: string): FunctionAbi | undefined {
  return useMemo(
    () =>
      contractAbi?.filter((abi): abi is FunctionAbi => abi.type === 'function').find(abi => abi.name === methodName),
    [contractAbi, methodName]
  )
}

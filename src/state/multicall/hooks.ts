import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Abi, number, FunctionAbi, validateAndParseAddress, hash, RawArgs, Contract } from 'starknet'
import { BigNumber } from '@ethersproject/bignumber'
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
import { useAccount, useBlockNumber } from '@starknet-react/core'
import { useAccountDetails } from '../../hooks'

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
  const { account, chainId } = useAccountDetails()
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

  if (!valid) return INVALID_CALL_STATE
  if (valid && !blockNumber) return LOADING_CALL_STATE
  if (!latestBlockNumber) return LOADING_CALL_STATE
  const success = data && data.length > 2

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
  callInputs: (RawArgs | undefined)[],
  options?: ListenerOptions
): CallState[] {
  // const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [contract, methodName])
  // const selector = useMemo(() => stark.getSelectorFromName(methodName), [methodName])

  const calls = useMemo(
    () =>
      contract && methodName && callInputs && callInputs.filter(input => typeof input !== 'undefined').length > 0
        ? callInputs.map<Call>(inputs => {
            const { calldata_len, calldata } = computeCallDataProps(inputs)

            return {
              address: validateAndParseAddress(contract.address),
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

  const { data: latestBlockNumber } = useBlockNumber({
    refetchInterval: false
  })
  return useMemo(() => {
    return results.map(result => toCallState(result, latestBlockNumber))
  }, [results, latestBlockNumber])
}

export function useMultipleContractSingleData(
  addresses: (string | undefined)[],
  contractInterface: Abi | undefined,
  methodName: string,
  callInputs?: RawArgs,
  options?: ListenerOptions
): CallState[] {
  const selector = useMemo(() => hash.getSelectorFromName(methodName), [methodName])
  const callDataProps = useMemo(() => computeCallDataProps(callInputs), [callInputs])

  const callDataLength = callDataProps?.calldata_len.toString()
  const callData = callDataProps?.calldata

  const calls = useMemo(
    () =>
      addresses && addresses.length > 0 && selector && isValidMethodArgs(callInputs)
        ? addresses.map<Call | undefined>(address => {
            return address
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

  const methodAbi = useValidatedMethodAbi(contractInterface, methodName)

  const results = useCallsData(calls, methodAbi, options)

  const { data: latestBlockNumber } = useBlockNumber({
    refetchInterval: false
  })
  return useMemo(() => {
    return results.map(result => toCallState(result, latestBlockNumber))
  }, [results, latestBlockNumber])
}

export function useSingleCallResult(
  contract: Contract | null | undefined,
  methodName: string,
  inputs?: RawArgs,
  options?: ListenerOptions
): CallState {
  //   const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [contract, methodName])

  const selector = useMemo(() => hash.getSelectorFromName(methodName), [methodName])
  const { calldata_len, calldata } = useMemo(() => computeCallDataProps(inputs), [inputs])

  const calls = useMemo<Call[]>(() => {
    return contract && selector && isValidMethodArgs(inputs)
      ? [
          {
            address: validateAndParseAddress(contract.address),
            methodName,
            calldata_len: calldata_len.toString(),
            calldata
          }
        ]
      : []
  }, [calldata, calldata_len, contract, inputs, methodName, selector])

  const methodAbi = useValidatedMethodAbi(contract?.abi, methodName)

  const result = useCallsData(calls, methodAbi, options)[0]

  const { data: latestBlockNumber } = useBlockNumber({
    refetchInterval: false
  })
  return useMemo(() => {
    return toCallState(result, latestBlockNumber)
  }, [result, latestBlockNumber])
}

export function useValidatedMethodAbi(contractAbi: Abi | undefined, methodName: string): FunctionAbi | undefined {
  return useMemo(
    () =>
      contractAbi?.filter((abi): abi is FunctionAbi => abi.type === 'function').find(abi => abi.name === methodName),
    [contractAbi, methodName]
  )
}

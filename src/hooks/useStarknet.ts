import { useCallback, useEffect, useState } from 'react'
import { Abi, Args, Contract } from 'starknet'
import { useActiveStarknetReact } from '.'
import { useBlockNumber } from '../state/application/hooks'
import { useTransactionAdder } from '../state/transactions/hooks'

export interface ListenerOptions {
  // how often this data should be fetched, by default 1
  readonly blocksPerFetch?: number
}

export interface CallState {
  result: Args | undefined
  loading: boolean
}

const LOADING_STATE_RESULT: CallState = {
  result: undefined,
  loading: true
}

// use this options object
export const NEVER_RELOAD: ListenerOptions = {
  blocksPerFetch: Infinity
}

export function useStarknetCall(
  contract: Contract | null | undefined,
  methodName: string | undefined,
  args?: any,
  options?: ListenerOptions
): Args {
  const [value, setValue] = useState<Args>({})
  const blockNumber = useBlockNumber()

  const refetchOnBlock = options !== NEVER_RELOAD ? blockNumber : null

  const callContract = useCallback(async () => {
    if (contract && methodName) {
      contract.call(methodName, args).then(res => setValue(res))
    }
  }, [contract, methodName, args])

  useEffect(() => {
    callContract()
  }, [callContract, refetchOnBlock])

  return value
}

export function useMultipleStarknetCallSingleData(
  addresses: (string | undefined)[],
  contractInterface: Abi[],
  methodName: string | undefined,
  args?: Args | undefined,
  options?: ListenerOptions
): (Args | undefined)[] {
  const { library } = useActiveStarknetReact()
  const blockNumber = useBlockNumber()
  const [calls, setCalls] = useState<(Args | undefined)[]>([])

  const callResults = useCallback(async () => {
    const callStates = await Promise.all(
      addresses.map(address => {
        if (!address || !contractInterface || !methodName) return undefined
        else {
          const contract = new Contract(contractInterface, address)

          return contract?.call(methodName, args)
        }
        // if (addresses && contractInterface && methodName) {
        //   const contract = new Contract(contractInterface, address)

        //   return contract?.call(methodName, args)
        // }
      })
    )

    setCalls(callStates)
  }, [])

  useEffect(() => {
    callResults()
  }, [callResults, blockNumber])

  return calls
}

type InvokeFunc = (args?: any) => void

interface StarknetInvoke {
  invoke?: InvokeFunc
  hash?: string
  submitting: boolean
}

export function useStarknetInvoke(contract: Contract | undefined, method: string | undefined): StarknetInvoke {
  const addTransaction = useTransactionAdder()

  const { account } = useActiveStarknetReact()

  const [invoke, setInvoke] = useState<InvokeFunc | undefined>(undefined)

  const [hash, setHash] = useState<string | undefined>(undefined)

  const [submitting, setSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (account && contract && method) {
      const invokeFunc = async (args?: any) => {
        setSubmitting(true)

        try {
          const transaction = await contract.invoke(method, args)
          const { transaction_hash } = transaction

          setHash(transaction_hash)
          setSubmitting(false)
          addTransaction(transaction)
        } catch (error) {
          setSubmitting(false)
          setHash(undefined)
        }
      }

      setInvoke(() => invokeFunc)
    } else {
      setInvoke(undefined)
    }
  }, [account, contract, method, addTransaction])

  return { invoke, hash, submitting }
}

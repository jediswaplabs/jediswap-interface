import { useCallback, useEffect, useState } from 'react'
import { Abi, Args, compileCalldata, Contract } from 'starknet'
import { getSelectorFromName } from 'starknet/dist/utils/stark'
import { useActiveStarknetReact } from '.'
import { useBlockNumber } from '../state/application/hooks'
import { useTransactionAdder } from '../state/transactions/hooks'
import { retry } from '../utils/retry'
import useDeepCompareEffect from 'use-deep-compare-effect'

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
  contract: Contract | null,
  methodName: string,
  args?: any,
  options?: ListenerOptions
): Args {
  const [value, setValue] = useState<Args>({})
  const blockNumber = useBlockNumber()

  const refetchOnBlock = options !== NEVER_RELOAD ? blockNumber : null

  const callContract = useCallback(
    (contract: Contract) => {
      try {
        return contract.call(methodName, args)
      } catch (error) {
        throw new Error('Failed Contract call')
      }
    },
    [methodName, args]
  )

  useEffect(() => {
    let isCancelled = false

    if (!contract || !methodName) return

    if (!isCancelled) {
      const { promise, cancel } = retry(() => callContract(contract), {
        n: Infinity,
        minWait: 2500,
        maxWait: 3500
      })

      promise.then(call => setValue(call))
    }
    return () => {
      isCancelled = true
    }
  }, [blockNumber, contract, methodName])

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

  // console.log(`Running ${methodName} for ${addresses}`)

  const callResults = useCallback(
    (addresses: (string | undefined)[], contractInterface: Abi[], methodName: string, args?: Args | undefined) => {
      return Promise.all(
        addresses.map(async address => {
          const contract = new Contract(contractInterface, address)
          // console.log('🚀 ~ file: useStarknet.ts ~ line 70 ~ callResults ~ contract', contract)
          const result = await contract?.call(methodName, args)
          return result
        })
      )
    },
    []
  )

  useDeepCompareEffect(() => {
    let isCancelled = false

    if (!contractInterface || !methodName || !addresses) return

    if (!isCancelled) {
      const { promise, cancel } = retry(() => callResults(addresses, contractInterface, methodName, args), {
        n: Infinity,
        minWait: 2500,
        maxWait: 3500
      })

      promise.then(call => setCalls(call)).catch(error => console.error('Error in: ', error))
    }

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractInterface, callResults, addresses, blockNumber])

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

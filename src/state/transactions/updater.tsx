import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useInterval from '../../hooks/useInterval'
import { useAddPopup } from '../application/hooks'
import { AppDispatch, AppState } from '../index'
import { checkedTransaction, updateTransaction, SerializableTransactionReceipt } from './actions'
import { useAccount, useBlockNumber } from '@starknet-react/core'

export function shouldCheck(
  lastBlockNumber: number,
  tx: { addedTime: number; receipt?: SerializableTransactionReceipt; lastCheckedBlockNumber?: number }
): boolean {
  if (tx.receipt && (tx.receipt.status === 'ACCEPTED_ON_L1' || tx.receipt.status === 'REJECTED')) return false
  if (!tx.lastCheckedBlockNumber) return true
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2
  } else {
    // otherwise every block
    return true
  }
}

export default function Updater(): null {
  const { account } = useAccount()
  const chainId = account?.chainId

  const { data: lastBlockNumber } = useBlockNumber({
    refetchInterval: false
  })
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

  const transactions = useMemo(() => (chainId ? state[chainId] ?? {} : {}), [chainId, state])

  // show popup on confirm
  const addPopup = useAddPopup()

  const checkTxStatusCallback = useCallback(() => {
    if (!chainId || !account || !lastBlockNumber) return

    Object.keys(transactions)
      .filter(hash => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach(hash => {
        account
          .getTransactionReceipt(hash)
          .then(receipt => {
            if (receipt) {
              if (!transactions[hash].receipt || transactions[hash].receipt?.status !== receipt.status) {
                dispatch(
                  updateTransaction({
                    chainId,
                    hash,
                    receipt: {
                      ...(receipt.status != 'REJECTED'
                        ? {
                            blockHash: receipt.block_hash,
                            blockNumber: Number(receipt.block_number),
                            transactionIndex: Number(receipt.transaction_index)
                          }
                        : {}),
                      transactionHash: receipt.transaction_hash,
                      status: receipt.status
                    }
                  })
                )

                if (receipt.status !== 'PENDING' && receipt.status !== 'ACCEPTED_ON_L1') {
                  addPopup(
                    {
                      txn: {
                        hash,
                        status: receipt.status,
                        summary: transactions[hash]?.summary
                      }
                    },
                    hash
                  )
                }
              }
            } else {
              dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
            }
          })
          .catch(error => {
            console.error(`failed to check transaction hash: ${hash}`, error)
          })
      })
  }, [chainId, account, transactions, lastBlockNumber, dispatch, addPopup])

  // Check Tx Status every 15s after account is initialized
  useInterval(checkTxStatusCallback, account ? 1000 * 15 : null)

  return null
}

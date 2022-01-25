import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@jediswap/sdk'
import { Status } from '@jediswap/starknet'

export interface SerializableTransactionReceipt {
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: Status
}

export const addTransaction = createAction<{
  chainId: ChainId
  hash: string
  from: string
  approval?: { tokenAddress: string; spender: string }
  claim?: { recipient: string }
  summary?: string
}>('transactions/addTransaction')
export const clearAllTransactions = createAction<{ chainId: ChainId }>('transactions/clearAllTransactions')
export const updateTransaction = createAction<{
  chainId: ChainId
  hash: string
  receipt: SerializableTransactionReceipt
}>('transactions/updateTransaction')
export const checkedTransaction = createAction<{
  chainId: ChainId
  hash: string
  blockNumber: number
}>('transactions/checkedTransaction')

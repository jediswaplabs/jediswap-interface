import { createStore, Store } from 'redux'
import { addTransaction, checkedTransaction, clearAllTransactions, updateTransaction } from './actions'
import reducer, { initialState, TransactionState } from './reducer'
import { ChainId } from '@jediswap/sdk'

describe('transaction reducer', () => {
  let store: Store<TransactionState>

  beforeEach(() => {
    store = createStore(reducer, initialState)
  })

  describe('addTransaction', () => {
    it('adds the transaction', () => {
      const beforeTime = new Date().getTime()
      store.dispatch(
        addTransaction({
          chainId: ChainId.SN_MAIN,
          summary: 'hello world',
          hash: '0x0',
          approval: { tokenAddress: 'abc', spender: 'def' },
          from: 'abc'
        })
      )
      const txs = store.getState()
      expect(txs[ChainId.SN_MAIN]).toBeTruthy()
      expect(txs[ChainId.SN_MAIN]?.['0x0']).toBeTruthy()
      const tx = txs[ChainId.SN_MAIN]?.['0x0']
      expect(tx).toBeTruthy()
      expect(tx?.hash).toEqual('0x0')
      expect(tx?.summary).toEqual('hello world')
      expect(tx?.approval).toEqual({ tokenAddress: 'abc', spender: 'def' })
      expect(tx?.from).toEqual('abc')
      expect(tx?.addedTime).toBeGreaterThanOrEqual(beforeTime)
    })
  })

  describe('finalizeTransaction', () => {
    it('no op if not valid transaction', () => {
      store.dispatch(
        updateTransaction({
          chainId: ChainId.SN_GOERLI,
          hash: '0x0',
          receipt: {
            status: 'ACCEPTED_ON_L2',
            transactionIndex: 1,
            transactionHash: '0x0',
            blockHash: '0x0',
            blockNumber: 1
          }
        })
      )
      expect(store.getState()).toEqual({})
    })
    it('sets receipt', () => {
      store.dispatch(
        addTransaction({
          hash: '0x0',
          chainId: ChainId.SN_GOERLI,
          approval: { spender: '0x0', tokenAddress: '0x0' },
          summary: 'hello world',
          from: '0x0'
        })
      )
      const beforeTime = new Date().getTime()
      store.dispatch(
        updateTransaction({
          chainId: ChainId.SN_GOERLI,
          hash: '0x0',
          receipt: {
            status: 'ACCEPTED_ON_L2',
            transactionIndex: 1,
            transactionHash: '0x0',
            blockHash: '0x0',
            blockNumber: 1
          }
        })
      )
      const tx = store.getState()[ChainId.SN_GOERLI]?.['0x0']
      expect(tx?.summary).toEqual('hello world')
      // expect(tx?.confirmedTime).toBeGreaterThanOrEqual(beforeTime)
      expect(tx?.receipt).toEqual({
        status: 'ACCEPTED_ON_L2',
        transactionIndex: 1,
        transactionHash: '0x0',
        blockHash: '0x0',
        blockNumber: 1
      })
    })
  })

  describe('checkedTransaction', () => {
    it('no op if not valid transaction', () => {
      store.dispatch(
        checkedTransaction({
          chainId: ChainId.SN_GOERLI,
          hash: '0x0',
          blockNumber: 1
        })
      )
      expect(store.getState()).toEqual({})
    })
    it('sets lastCheckedBlockNumber', () => {
      store.dispatch(
        addTransaction({
          hash: '0x0',
          chainId: ChainId.SN_GOERLI,
          approval: { spender: '0x0', tokenAddress: '0x0' },
          summary: 'hello world',
          from: '0x0'
        })
      )
      store.dispatch(
        checkedTransaction({
          chainId: ChainId.SN_GOERLI,
          hash: '0x0',
          blockNumber: 1
        })
      )
      const tx = store.getState()[ChainId.SN_GOERLI]?.['0x0']
      expect(tx?.lastCheckedBlockNumber).toEqual(1)
    })
    it('never decreases', () => {
      store.dispatch(
        addTransaction({
          hash: '0x0',
          chainId: ChainId.SN_GOERLI,
          approval: { spender: '0x0', tokenAddress: '0x0' },
          summary: 'hello world',
          from: '0x0'
        })
      )
      store.dispatch(
        checkedTransaction({
          chainId: ChainId.SN_GOERLI,
          hash: '0x0',
          blockNumber: 3
        })
      )
      store.dispatch(
        checkedTransaction({
          chainId: ChainId.SN_GOERLI,
          hash: '0x0',
          blockNumber: 1
        })
      )
      const tx = store.getState()[ChainId.SN_GOERLI]?.['0x0']
      expect(tx?.lastCheckedBlockNumber).toEqual(3)
    })
  })

  describe('clearAllTransactions', () => {
    it('removes all transactions for the chain', () => {
      store.dispatch(
        addTransaction({
          chainId: ChainId.SN_MAIN,
          summary: 'hello world',
          hash: '0x0',
          approval: { tokenAddress: 'abc', spender: 'def' },
          from: 'abc'
        })
      )
      store.dispatch(
        addTransaction({
          chainId: ChainId.SN_GOERLI,
          summary: 'hello world',
          hash: '0x1',
          approval: { tokenAddress: 'abc', spender: 'def' },
          from: 'abc'
        })
      )
      expect(Object.keys(store.getState())).toHaveLength(2)
      expect(Object.keys(store.getState())).toEqual([String(ChainId.SN_MAIN), String(ChainId.SN_GOERLI)])
      expect(Object.keys(store.getState()[ChainId.SN_MAIN] ?? {})).toEqual(['0x0'])
      expect(Object.keys(store.getState()[ChainId.SN_GOERLI] ?? {})).toEqual(['0x1'])
      store.dispatch(clearAllTransactions({ chainId: ChainId.SN_MAIN }))
      expect(Object.keys(store.getState())).toHaveLength(2)
      expect(Object.keys(store.getState())).toEqual([String(ChainId.SN_MAIN), String(ChainId.SN_GOERLI)])
      expect(Object.keys(store.getState()[ChainId.SN_MAIN] ?? {})).toEqual([])
      expect(Object.keys(store.getState()[ChainId.SN_GOERLI] ?? {})).toEqual(['0x1'])
    })
  })
})

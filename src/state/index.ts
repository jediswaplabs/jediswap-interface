import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import transactions from './transactions/reducer'
import swap from './swap/reducer'
import lists from './lists/reducer'
import multicall from './multicall/reducer'
import mint from './mint/reducer'
import burn from './burn/reducer'
import zap from './zap/reducer'
import pairs from './pairs/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions']

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    swap,
    mint,
    burn,
    multicall,
    lists,
    zap,
    pairs
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: false }).concat(save({ states: PERSISTED_KEYS })),
  preloadedState: load({ states: PERSISTED_KEYS })
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

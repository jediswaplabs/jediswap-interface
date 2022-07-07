import { updateAllPairs } from './actions'
import { createReducer } from '@reduxjs/toolkit'

export interface AllPairsState {
  readonly allPairs: string[]
}

export const initialState: AllPairsState = {
  allPairs: []
}

export default createReducer(initialState, builder =>
  builder.addCase(updateAllPairs, (state, action) => {
    state.allPairs = [...action.payload.allPairs]
  })
)

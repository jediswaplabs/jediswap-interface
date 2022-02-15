import { createReducer } from '@reduxjs/toolkit'
import { Field, replaceZapState, selectCurrency, typeInput, setRecipient } from './actions'

export interface ZapState {
  readonly indepenentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly lpTokenId: string | undefined
  }
  readonly recipient: string | null
}

const initialState: ZapState = {
  indepenentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: ''
  },
  [Field.OUTPUT]: {
    lpTokenId: ''
  },
  recipient: null
}

export default createReducer<ZapState>(initialState, builder => {
  builder
    .addCase(
      replaceZapState,
      (state, { payload: { typedValue, recipient, field, inputCurrencyId, outputLPTokenId } }) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId
          },
          [Field.OUTPUT]: {
            lpTokenId: outputLPTokenId
          },
          indepenentField: field,
          typedValue: typedValue,
          recipient
        }
      }
    )
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        indepenentField: field,
        typedValue
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
})

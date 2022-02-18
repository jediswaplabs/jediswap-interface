import { createReducer } from '@reduxjs/toolkit'
import { Field, replaceZapState, selectCurrency, typeInput, setRecipient } from './actions'

export interface ZapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
  readonly recipient: string | null
}

const initialState: ZapState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: ''
  },
  [Field.OUTPUT]: {
    currencyId: ''
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
            currencyId: outputLPTokenId
          },
          independentField: field,
          typedValue: typedValue,
          recipient
        }
      }
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      // const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      return {
        ...state,
        [field]: { currencyId: currencyId }
      }
    })
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

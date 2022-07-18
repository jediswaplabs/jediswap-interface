import { createAction } from '@reduxjs/toolkit'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  LIQUIDITY = 'LIQUIDITY',
  LIQUIDITY_PERCENT = 'LIQUIDITY_PERCENT',
  LIQUIDITY_CURRENCY_A = 'LIQUIDITY_CURRENCY_A',
  LIQUIDITY_CURRENCY_B = 'LIQUIDITY_CURRENCY_B'
}

export enum Modes {
  IN = 'IN',
  OUT = 'OUT'
}

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('zap/selectCurrency')
export const typeInput = createAction<{ field: Field; typedValue: string }>('zap/typeInput')
export const replaceZapState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputLPTokenId?: string
  recipient: string | null
}>('zap/replaceZapState')
export const setRecipient = createAction<{ recipient: string | null }>('zap/setRecipient')
export const reset = createAction('zap/reset')

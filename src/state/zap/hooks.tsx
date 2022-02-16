import { Currency, CurrencyAmount, Token, TOKEN0 } from '@jediswap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveStarknetReact } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useAddressNormalizer } from '../../hooks/useAddressNormalizer'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { tryParseAmount, useSwapState } from '../swap/hooks'
import { useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, selectCurrency, setRecipient, typeInput } from './actions'

export function useZapState(): AppState['zap'] {
  return useSelector<AppState, AppState['zap']>(state => state.zap)
}

export function useZapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === TOKEN0 ? 'TOKEN0' : ''
        })
      )
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onCurrencySelection,
    onUserInput,
    onChangeRecipient
  }
}

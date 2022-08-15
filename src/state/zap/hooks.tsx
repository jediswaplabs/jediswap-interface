import { Currency, CurrencyAmount, Token, ETHER, LPToken, TokenAmount, Trade } from '@jediswap/sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveStarknetReact } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useAddressNormalizer } from '../../hooks/useAddressNormalizer'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { useLPOutAmount, useZapTrades } from '../../hooks/Zap'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import {
  parseCurrencyFromURLParameter,
  parseTokenAmountURLParameter,
  tryParseAmount,
  useSwapState,
  validatedRecipient
} from '../swap/hooks'
import { useUserSlippageTolerance } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceZapState, selectCurrency, setRecipient, typeInput } from './actions'
import { ZapState } from './reducer'

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
          currencyId: currency instanceof Token ? currency.address : currency === ETHER ? 'ETH' : ''
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

export function useDerivedZapInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  lpAmountOut: TokenAmount | undefined
  zapTrade: Trade | undefined
  // zapTrade: any
  inputError?: string
  tradeLoading?: boolean
} {
  const { account, connectedAddress } = useActiveStarknetReact()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputLPCurrencyId },
    recipient
  } = useZapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputLPCurrency = useCurrency(outputLPCurrencyId)

  const address = useAddressNormalizer(recipient ?? undefined)
  const to: string | null = (recipient === null ? connectedAddress : address) ?? null

  const relevantTokenBalances = useCurrencyBalances(connectedAddress ?? undefined, [
    inputCurrency ?? undefined,
    outputLPCurrency ?? undefined
  ])

  const parsedAmount = tryParseAmount(typedValue, inputCurrency ?? undefined)

  const outputLpToken = outputLPCurrency instanceof LPToken ? outputLPCurrency : undefined

  const [zapTrade, zapLoading] = useZapTrades(parsedAmount, outputLpToken)

  const [lpAmountOut, lpAmountTrade, lpLoading] = useLPOutAmount(parsedAmount, outputLpToken, zapTrade)

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputLPCurrency ?? undefined
  }

  let inputError: string | undefined

  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select Token'
  }

  const formattedTo = isAddress(to)

  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  }

  // const [allowedSlippage] = useUserSlippageTolerance()

  // const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], currencyBalances[Field.INPUT]]

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    lpAmountOut,
    zapTrade: lpAmountTrade ?? undefined,
    inputError,
    tradeLoading: zapLoading || lpLoading
  }
}

export function queryParametersToZapState(parsedQs: ParsedQs): ZapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)

  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: Field.INPUT,
    recipient
  }
}

// updates the zap state to use the defaults for a given network
export function useZapDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveStarknetReact()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToZapState(parsedQs)

    dispatch(
      replaceZapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputLPTokenId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient
      })
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}

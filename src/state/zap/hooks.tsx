import { Currency, CurrencyAmount, Token, ETHER, LPToken, TokenAmount, Trade, JSBI, Percent } from '@jediswap/sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveStarknetReact } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useAddressNormalizer } from '../../hooks/useAddressNormalizer'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { useLPOutAmount, useCurrencyOutFromLpAmount, useZapInTrades, useZapOutTrades } from '../../hooks/Zap'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'

import {
  parseCurrencyFromURLParameter,
  parseTokenAmountURLParameter,
  tryParseAmount,
  validatedRecipient
} from '../swap/hooks'

import { useCurrencyBalances, useTokenBalances } from '../wallet/hooks'
import { Field, replaceZapState, selectCurrency, setRecipient, typeInput } from './actions'
import { ZapState } from './reducer'
import { usePair } from '../../data/Reserves'
import { useTotalSupply } from '../../data/TotalSupply'

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

export function useDerivedZapOutInfo(): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: {
    [Field.LIQUIDITY]?: TokenAmount
    [Field.LIQUIDITY_CURRENCY_A]?: CurrencyAmount
    [Field.LIQUIDITY_CURRENCY_B]?: CurrencyAmount
  }
  currencyAmountOut: TokenAmount | undefined
  zapTrade: Trade | undefined
  inputError?: string
  tradeLoading?: boolean
} {
  const { account, connectedAddress, chainId } = useActiveStarknetReact()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputLPCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useZapState()

  let inputLPCurrency = useCurrency(inputLPCurrencyId)
  let outputCurrency = useCurrency(outputCurrencyId)

  const [pairState, pair] = usePair(inputLPCurrency?.token0, inputLPCurrency?.token1)
  const inputLPToken0 = pair?.token0
  const inputLPToken1 = pair?.token1

  const address = useAddressNormalizer(recipient ?? undefined)
  const to: string | null = (recipient === null ? connectedAddress : address) ?? null

  // balances
  const relevantLpTokenBalance = useTokenBalances(connectedAddress ?? undefined, [pair?.liquidityToken])
  const relevantCurrencyBalances = useCurrencyBalances(connectedAddress ?? undefined, [
    inputLPCurrency ?? undefined,
    outputCurrency ?? undefined
  ])
  const userLiquidity: undefined | TokenAmount = relevantLpTokenBalance?.[pair?.liquidityToken?.address ?? '']

  // liquidity values
  const totalSupply = useTotalSupply(pair?.liquidityToken)
  const liquidityValueA =
    pair &&
    totalSupply &&
    userLiquidity &&
    inputLPToken0 &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
      ? new TokenAmount(inputLPToken0, pair.getLiquidityValue(inputLPToken0, totalSupply, userLiquidity, false).raw)
      : undefined

  const liquidityValueB =
    pair &&
    totalSupply &&
    userLiquidity &&
    inputLPToken1 &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
      ? new TokenAmount(inputLPToken1, pair.getLiquidityValue(inputLPToken1, totalSupply, userLiquidity, false).raw)
      : undefined

  let percentToRemove: Percent = new Percent('0', '100')
  percentToRemove = new Percent(typedValue, '100')

  const parsedAmount: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.LIQUIDITY_CURRENCY_A]?: TokenAmount
    [Field.LIQUIDITY_CURRENCY_B]?: TokenAmount
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]:
      userLiquidity && percentToRemove && percentToRemove.greaterThan('0')
        ? new TokenAmount(inputLPCurrency, percentToRemove.multiply(userLiquidity.raw).quotient)
        : undefined,
    [Field.LIQUIDITY_CURRENCY_A]:
      inputLPToken0 && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA
        ? new TokenAmount(inputLPToken0, percentToRemove.multiply(liquidityValueA.raw).quotient)
        : undefined,
    [Field.LIQUIDITY_CURRENCY_B]:
      inputLPToken1 && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB
        ? new TokenAmount(inputLPToken1, percentToRemove.multiply(liquidityValueB.raw).quotient)
        : undefined
  }

  const inputLPCurrencyResult = inputLPCurrency instanceof LPToken ? inputLPCurrency : undefined
  const outputCurrencyResult = outputCurrency instanceof Currency ? outputCurrency : undefined

  const [zapTrade, zapLoading] = useZapOutTrades(inputLPCurrencyResult, parsedAmount, outputCurrencyResult)
  // console.log('🚀 ~ file: hooks.tsx ~ line 103 ~ useDerivedZapOutInfo ~ zapTrade', zapTrade)

  const [currencyAmountOut, outputCurrencyAmountTrade, outputLoading] = useCurrencyOutFromLpAmount(
    parsedAmount,
    outputCurrencyResult,
    zapTrade
  )

  const currencyBalances = {
    [Field.INPUT]: relevantCurrencyBalances[0],
    [Field.OUTPUT]: relevantCurrencyBalances[1]
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputLPCurrencyResult ?? undefined,
    [Field.OUTPUT]: outputCurrencyResult ?? undefined
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

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    currencyAmountOut,
    zapTrade: outputCurrencyAmountTrade ?? undefined,
    inputError,
    tradeLoading: zapLoading || outputLoading
  }
}

export function useDerivedZapInInfo(): {
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
  const [zapTrade, zapLoading] = useZapInTrades(parsedAmount, outputLpToken)
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

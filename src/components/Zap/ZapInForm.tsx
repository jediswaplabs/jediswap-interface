import React, { useCallback, useState } from 'react'
import { Currency, CurrencyAmount, JSBI, Trade } from '@jediswap/sdk'
import { Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as ArrowRight } from '../../assets/images/arrow-right-blue.svg'

import CurrencyInputPanel from '../CurrencyInputPanel'

import { DMSansText } from '../../theme'

import { HeaderRow } from '../../pages/Zap/styleds'
import { AddTokenRow, AddTokenText } from '../../pages/Swap/styleds'
import { BottomGrouping } from '../swap/styleds'

import { useDerivedZapInInfo, useZapActionHandlers, useZapState } from '../../state/zap/hooks'
import { Field } from '../../state/zap/actions'

import { useWalletModalToggle } from '../../state/application/hooks'

import { useUserSlippageTolerance } from '../../state/user/hooks'

import { useActiveStarknetReact } from '../../hooks'
import { useZapCallback } from '../../hooks/useZapCallback'
import { useAddTokenToWallet } from '../../hooks/useAddTokenToWallet'

import { SwapArrowDown } from '../SwapArrowDown'
import { ButtonError, ButtonPrimary, RedGradientButton } from '../Button'
import { AutoRow } from '../Row'
import Column, { AutoColumn } from '../Column'

import { maxAmountSpend } from '../../utils/maxAmountSpend'

const InputHeaderLine = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`

export default function ZapInForm({
  onSubmit
}: {
  onSubmit: ({ trade, callback, tokenAmountIn, tokenAmountOut }) => void
}) {
  const {
    currencies,
    currencyBalances,
    parsedAmount,
    inputError: zapInputError,
    lpAmountOut,
    tradeLoading,
    zapTrade
  } = useDerivedZapInInfo()

  const [allowedSlippage] = useUserSlippageTolerance()
  const { account } = useActiveStarknetReact()

  const toggleWalletModal = useWalletModalToggle()

  const { independentField, typedValue, recipient } = useZapState()

  const addTokenToWallet = useAddTokenToWallet()
  const { onCurrencySelection, onUserInput, onChangeRecipient } = useZapActionHandlers()

  const { callback: zapCallback, error: zapCallbackError } = useZapCallback(
    zapTrade,
    lpAmountOut,
    allowedSlippage,
    recipient
  )

  const parsedAmounts = {
    [Field.INPUT]: parsedAmount,
    // TODO: Get correct OUTPUT amount
    [Field.OUTPUT]: lpAmountOut
  }

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const insufficientBalanceError = zapInputError?.includes('balance')

  const route = zapTrade?.route
  const noRoute = !route
  const isValid = !zapInputError

  const formattedAmounts = {
    [Field.INPUT]: typedValue,
    [Field.OUTPUT]: parsedAmounts[Field.OUTPUT]?.toSignificant(6) ?? ''
  }

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))
  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleOutputSelect = useCallback(
    outputCurrency => {
      console.log('🚀 ~ file: ZapInForm.tsx ~ line 112 ~ Zap ~ outputCurrency', outputCurrency)
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleInputSelect = useCallback(
    inputCurrency => {
      console.log('🚀 ~ file: ZapInForm.tsx ~ line 103 ~ Zap ~ inputCurrency', inputCurrency)
      // setApprovalSubmitted(false)
      onCurrencySelection(Field.INPUT, inputCurrency)
      handleTypeInput('')
    },
    [handleTypeInput, onCurrencySelection]
  )

  const handleSubmit = useCallback(() => {
    onSubmit({
      trade: zapTrade,
      callback: zapCallback,
      tokenAmountIn: parsedAmount,
      tokenAmountOut: lpAmountOut
    })
  }, [zapTrade, zapCallback, lpAmountOut, parsedAmount])

  return (
    <>
      <InputHeaderLine>
        <DMSansText.body>From</DMSansText.body>
        <DMSansText.body>Balance: {currencyBalances.INPUT?.toSignificant(6) ?? 0}</DMSansText.body>
      </InputHeaderLine>

      <AutoColumn>
        <CurrencyInputPanel
          id="zap-currency-input"
          value={formattedAmounts[Field.INPUT]}
          showMaxButton={!atMaxAmountInput}
          currency={currencies[Field.INPUT]}
          onUserInput={handleTypeInput}
          onMax={handleMaxInput}
          onCurrencySelect={handleInputSelect}
          otherCurrency={currencies[Field.OUTPUT]}
          showLPTokens={false}
        />

        <AutoColumn justify="space-between" style={{ margin: '16px 0 7.5px' }}>
          <AutoRow justify="center">
            <SwapArrowDown wrapperSize={36} iconSize={20} />
          </AutoRow>
        </AutoColumn>

        <InputHeaderLine
          style={{
            marginTop: currencyBalances.OUTPUT && currencyBalances.OUTPUT?.toSignificant(6).length > 10 ? '10px' : '0'
          }}
        >
          <DMSansText.body>To LP (estimated)</DMSansText.body>
          <DMSansText.body>Balance: {currencyBalances.OUTPUT?.toSignificant(6) ?? 0}</DMSansText.body>
        </InputHeaderLine>

        <CurrencyInputPanel
          id="zap-currency-output"
          value={formattedAmounts[Field.OUTPUT]}
          showMaxButton={false}
          currency={currencies[Field.OUTPUT]}
          onUserInput={handleTypeOutput}
          onCurrencySelect={handleOutputSelect}
          otherCurrency={currencies[Field.INPUT]}
          showLPTokens={true}
          disableInput={true}
        />

        {/* TODO: Implement Price of Zap and Slippage if required  */}
      </AutoColumn>

      <BottomGrouping marginTop="30px">
        {(() => {
          switch (true) {
            case !account: {
              return (
                <ButtonPrimary fontSize={20} onClick={toggleWalletModal}>
                  Connect Wallet
                </ButtonPrimary>
              )
            }

            case noRoute && userHasSpecifiedInputOutput: {
              return (
                <RedGradientButton fontSize={20} style={{ textAlign: 'center' }} disabled>
                  {tradeLoading ? 'Fetching LP Amount...' : 'Insufficient liquidity for this trade'}
                </RedGradientButton>
              )
            }

            case insufficientBalanceError: {
              return (
                <RedGradientButton id="zap-button" disabled>
                  {zapInputError}
                </RedGradientButton>
              )
            }

            default: {
              return (
                <ButtonError onClick={handleSubmit} id="zap-button" disabled={!isValid || !!zapCallbackError}>
                  <Text>{zapInputError ? zapInputError : 'Zap In'}</Text>
                </ButtonError>
              )
            }
          }
        })()}
      </BottomGrouping>

      {account && lpAmountOut && lpAmountOut.token && (
        <AddTokenRow justify={'center'} onClick={() => addTokenToWallet(lpAmountOut.token.address)}>
          <AddTokenText>Add LP Tokens to Wallet</AddTokenText>
          <ArrowRight width={16} height={15} />
        </AddTokenRow>
      )}
    </>
  )
}

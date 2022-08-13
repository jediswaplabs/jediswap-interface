import React, { useCallback, useState } from 'react'
import { CurrencyAmount, JSBI, TokenAmount, Trade } from '@jediswap/sdk'
import { Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as ArrowRight } from '../../assets/images/arrow-right-blue.svg'

import CurrencyInputPanel from '../CurrencyInputPanel'

import { DMSansText } from '../../theme'

import { AddTokenRow, AddTokenText } from '../../pages/Swap/styleds'
import { BottomGrouping } from '../swap/styleds'

import { useDerivedZapOutInfo, useZapActionHandlers, useZapState } from '../../state/zap/hooks'
import { Field } from '../../state/zap/actions'

import { useWalletModalToggle } from '../../state/application/hooks'

import { useUserSlippageTolerance } from '../../state/user/hooks'

import { useActiveStarknetReact } from '../../hooks'
import { useAddTokenToWallet } from '../../hooks/useAddTokenToWallet'

import { SwapArrowDown } from '../SwapArrowDown'
import { ButtonError, ButtonPrimary, RedGradientButton } from '../Button'
import { AutoRow } from '../Row'
import { AutoColumn } from '../Column'

import { useZapCallback } from '../../hooks/useZapCallback'

const InputHeaderLine = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`

export default function ZapOutForm({
  onSubmit
}: {
  onSubmit: ({ trade, callback, tokenAmountIn, tokenAmountOut }) => void
}) {
  const {
    currencies,
    currencyBalances,
    parsedAmount,
    inputError: zapInputError,
    currencyAmountOut,
    tradeLoading,
    zapTrade
  } = useDerivedZapOutInfo()

  const [allowedSlippage] = useUserSlippageTolerance()
  const { account } = useActiveStarknetReact()

  const toggleWalletModal = useWalletModalToggle()

  const { independentField, typedValue, recipient } = useZapState()

  const addTokenToWallet = useAddTokenToWallet()
  const { onCurrencySelection, onUserInput, onChangeRecipient } = useZapActionHandlers()

  const { callback: zapCallback, error: zapCallbackError } = useZapCallback(
    zapTrade,
    currencyAmountOut,
    allowedSlippage,
    recipient
  )

  const parsedAmounts = {
    [Field.INPUT]: parsedAmount[Field.LIQUIDITY_PERCENT],
    [Field.OUTPUT]: currencyAmountOut
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

  const handleTypeInput = useCallback(
    (value: string) => {
      if (parseInt(value) <= 100 || value === '') {
        onUserInput(Field.INPUT, value)
      }
    },
    [onUserInput]
  )

  const handleOutputSelect = useCallback(
    outputCurrency => {
      console.log('🚀 ~ file: ZapOutForm.tsx ~ line 112 ~ Zap ~ outputCurrency', outputCurrency)
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

  const handleInputSelect = useCallback(
    inputCurrency => {
      console.log('🚀 ~ file: ZapOutForm.tsx ~ line 103 ~ Zap ~ inputCurrency', inputCurrency)
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
      tokenAmountIn: parsedAmount[Field.LIQUIDITY],
      tokenAmountOut: currencyAmountOut
    })
  }, [zapTrade, zapCallback, currencyAmountOut, parsedAmount])

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
          currencyBalance={currencyBalances.INPUT}
          showAmountPickerPanel={true}
          placeholder={'0'}
          showMaxButton={false}
          currency={currencies[Field.INPUT]}
          onUserInput={handleTypeInput}
          onCurrencySelect={handleInputSelect}
          otherCurrency={currencies[Field.OUTPUT]}
          showLPTokens={true}
          percentagesMode={true}
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
          <DMSansText.body>To (estimated)</DMSansText.body>
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
          showLPTokens={false}
          disableInput={true}
          readOnlyMode={true}
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
                  {tradeLoading ? 'Fetching amount...' : 'Insufficient liquidity for this trade'}
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
                  <Text>{zapInputError ? zapInputError : 'Zap Out'}</Text>
                </ButtonError>
              )
            }
          }
        })()}
      </BottomGrouping>

      {account && currencyAmountOut && currencyAmountOut.token && (
        <AddTokenRow justify={'center'} onClick={() => addTokenToWallet(currencyAmountOut.token.address)}>
          <AddTokenText>Add token to Wallet</AddTokenText>
          <ArrowRight width={16} height={15} />
        </AddTokenRow>
      )}
    </>
  )
}

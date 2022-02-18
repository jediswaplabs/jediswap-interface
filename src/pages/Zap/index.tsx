import React, { useCallback, useEffect, useState } from 'react'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import AppBody from '../AppBody'
import { Wrapper, HeaderRow, ZapHeader, StyledZapIcon } from './styleds'
import Settings from '../../components/Settings'
import { DMSansText } from '../../theme'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow } from '../../components/Row'
import { ArrowWrapper, BottomGrouping } from '../../components/swap/styleds'
import { Icon, IconWrapper } from '../Swap/styleds'
import SwapWidget from '../../assets/jedi/SwapWidget.svg'
import { useActiveStarknetReact } from '../../hooks'
import { ButtonPrimary } from '../../components/Button'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import {
  useDerivedZapInfo,
  useZapActionHandlers,
  useZapDefaultsFromURLSearch,
  useZapState
} from '../../state/zap/hooks'
import { Field } from '../../state/zap/actions'
import { CurrencyAmount, TokenAmount } from '@jediswap/sdk'
import { tryParseAmount } from '../../state/swap/hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { ZAP_IN_ADDRESS } from '../../constants'
import { maxAmountSpend } from '../../utils/maxAmountSpend'

export default function Zap() {
  const loadedUrlParams = useZapDefaultsFromURLSearch()

  const { account } = useActiveStarknetReact()

  const toggleWalletModal = useWalletModalToggle()

  const [allowedSlippage] = useUserSlippageTolerance()

  const { independentField, typedValue, recipient } = useZapState()

  const { onCurrencySelection, onUserInput, onChangeRecipient } = useZapActionHandlers()

  const { currencies, currencyBalances, parsedAmount, inputError: zapInputError } = useDerivedZapInfo()

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const parsedAmounts = {
    [Field.INPUT]: parsedAmount,

    // TODO: Get correct OUTPUT amount
    [Field.OUTPUT]: tryParseAmount(currencyBalances[Field.OUTPUT]?.toExact(), currencies[Field.OUTPUT])
  }

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const isValid = !zapInputError

  const [approval, approveCallback] = useApproveCallback(parsedAmount, ZAP_IN_ADDRESS)

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    } else if (ApprovalState.NOT_APPROVED && approvalSubmitted) {
      setApprovalSubmitted(false)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  const insufficientBalanceError = zapInputError?.includes('balance')

  const showApproveFlow =
    !zapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED))

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const handleInputSelect = useCallback(
    inputCurrency => {
      console.log('🚀 ~ file: index.tsx ~ line 103 ~ Zap ~ inputCurrency', inputCurrency)
      setApprovalSubmitted(false)
      onCurrencySelection(Field.INPUT, inputCurrency)
      handleTypeInput('')
    },
    [handleTypeInput, onCurrencySelection]
  )

  const handleOutputSelect = useCallback(
    outputCurrency => {
      console.log('🚀 ~ file: index.tsx ~ line 112 ~ Zap ~ outputCurrency', outputCurrency)

      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  return (
    <>
      <AppBody>
        <SwapPoolTabs active={'zap'} />
        <Wrapper>
          {/* TODO: Implement ConfirmZapModal */}
          <div style={{ marginBottom: '30px' }}>
            <HeaderRow>
              <ZapHeader>
                Zap <StyledZapIcon />
              </ZapHeader>
              <Settings />
            </HeaderRow>
          </div>
          <HeaderRow style={{ marginBottom: '16px' }}>
            <DMSansText.body>From</DMSansText.body>
            <DMSansText.body>Balance: {currencyBalances.INPUT?.toSignificant(6) ?? 0}</DMSansText.body>
          </HeaderRow>
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
            />

            <AutoColumn justify="space-between">
              <AutoRow justify="center">
                <ArrowWrapper>
                  <IconWrapper>
                    <Icon noMargin unlimited src={SwapWidget} />
                  </IconWrapper>
                </ArrowWrapper>
              </AutoRow>
            </AutoColumn>
            <HeaderRow style={{ marginBottom: '16px' }}>
              {/* TODO: Add marginTop to HeaderRow if OutputPair Balance's length > 10. Check Swap */}
              <DMSansText.body>To LP (estimated)</DMSansText.body>
              <DMSansText.body>Balance: {currencyBalances.OUTPUT?.toSignificant(6) ?? 0}</DMSansText.body>
            </HeaderRow>
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
            ></CurrencyInputPanel>
            {/* TODO: Implement Price of Zap and Slippage if required  */}
          </AutoColumn>

          <BottomGrouping>
            {!account ? (
              <ButtonPrimary fontSize={20} onClick={toggleWalletModal}>
                Connect Wallet
              </ButtonPrimary>
            ) : (
              <ButtonPrimary fontSize={20} disabled>
                Enter an amount
              </ButtonPrimary>
            )}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
    </>
  )
}

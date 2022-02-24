import React, { useCallback, useEffect, useState } from 'react'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import AppBody from '../AppBody'
import { Wrapper, HeaderRow, ZapHeader, HeaderNote, ZapHeaderInfo } from './styleds'
import Settings from '../../components/Settings'
import { DMSansText } from '../../theme'
import Column, { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow, RowBetween, RowCentered } from '../../components/Row'
import { ArrowWrapper, BottomGrouping } from '../../components/swap/styleds'
import { Icon, IconWrapper } from '../Swap/styleds'
import SwapWidget from '../../assets/jedi/SwapWidget.svg'
import { useActiveStarknetReact } from '../../hooks'
import { ButtonConfirmed, ButtonError, ButtonPrimary, RedGradientButton } from '../../components/Button'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import {
  useDerivedZapInfo,
  useZapActionHandlers,
  useZapDefaultsFromURLSearch,
  useZapState
} from '../../state/zap/hooks'
import { Field } from '../../state/zap/actions'
import { CurrencyAmount, JSBI, TokenAmount } from '@jediswap/sdk'
import { tryParseAmount } from '../../state/swap/hooks'
import { ApprovalState, useApproveCallback, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { ZAP_IN_ADDRESS } from '../../constants'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import Loader from '../../components/Loader'
import { Text } from 'rebass'
import ProgressSteps from '../../components/ProgressSteps'
import ZapIcon from '../../assets/jedi/zap.svg'
import { SwapArrowDown } from '../../components/SwapArrowDown'
import { useZapCallback } from '../../hooks/useZapCallback'

export default function Zap() {
  const loadedUrlParams = useZapDefaultsFromURLSearch()

  const { account } = useActiveStarknetReact()

  const toggleWalletModal = useWalletModalToggle()

  const [allowedSlippage] = useUserSlippageTolerance()

  const { independentField, typedValue, recipient } = useZapState()

  const { onCurrencySelection, onUserInput, onChangeRecipient } = useZapActionHandlers()

  const {
    currencies,
    currencyBalances,
    parsedAmount,
    inputError: zapInputError,
    lpAmountOut,
    tradeLoading,
    zapTrade
  } = useDerivedZapInfo()
  console.log('🚀 ~ file: index.tsx ~ line 58 ~ Zap ~ lpAmountOut', lpAmountOut)

  const parsedAmounts = {
    [Field.INPUT]: parsedAmount,

    // TODO: Get correct OUTPUT amount
    [Field.OUTPUT]: lpAmountOut
  }

  // const dependentField: Field = Field.OUTPUT

  // const formattedOutput = tradeLoading ? 'Loading...' : parsedAmounts[Field.OUTPUT]?.toSignificant(6) ?? ''

  const formattedAmounts = {
    [Field.INPUT]: typedValue,
    [Field.OUTPUT]: parsedAmounts[Field.OUTPUT]?.toSignificant(6) ?? ''
  }

  const route = zapTrade?.route
  console.log('🚀 ~ file: index.tsx ~ line 73 ~ Zap ~ route', route)

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const noRoute = !route

  const isValid = !zapInputError

  const [approvalState, approveCallback] = useApproveCallbackFromTrade(zapTrade, allowedSlippage, 'zap')

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    } else if (ApprovalState.NOT_APPROVED && approvalSubmitted) {
      setApprovalSubmitted(false)
    }
  }, [approvalState, approvalSubmitted])

  const { callback: zapCallback, error: zapCallbackError } = useZapCallback(
    zapTrade,
    lpAmountOut,
    allowedSlippage,
    recipient
  )

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  const insufficientBalanceError = zapInputError?.includes('balance')

  const showApproveFlow =
    !zapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED))

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

  const handleZap = useCallback(() => {
    if (!zapCallback) {
      return
    }
    zapCallback().then(hash => console.log('Zap Hash: ', hash))
  }, [zapCallback])

  return (
    <>
      <AppBody>
        <SwapPoolTabs active={'zap'} />
        <Wrapper>
          {/* TODO: Implement ConfirmZapModal */}
          <AutoColumn gap="14px" style={{ marginBottom: '18px' }}>
            <HeaderRow>
              <ZapHeader>
                Zap <img src={ZapIcon} />
              </ZapHeader>
              <Settings />
            </HeaderRow>
            <ZapHeaderInfo fontSize={16}>
              Zap helps you convert any of your tokens into LP tokens with 1-click
            </ZapHeaderInfo>
            <HeaderNote> WARNING: Zap can cause slippage. Small amounts only.</HeaderNote>
          </AutoColumn>

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

            <AutoColumn justify="space-between" style={{ margin: '16px 0 7.5px' }}>
              <AutoRow justify="center">
                <SwapArrowDown wrapperSize={36} iconSize={20} />
              </AutoRow>
            </AutoColumn>

            <HeaderRow
              style={{
                marginBottom: '16px',
                marginTop:
                  currencyBalances.OUTPUT && currencyBalances.OUTPUT?.toSignificant(6).length > 10 ? '10px' : '0'
              }}
            >
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

          <BottomGrouping marginTop="50px">
            {!account ? (
              <ButtonPrimary fontSize={20} onClick={toggleWalletModal}>
                Connect Wallet
              </ButtonPrimary>
            ) : noRoute && userHasSpecifiedInputOutput ? (
              <RedGradientButton fontSize={20} style={{ textAlign: 'center' }} disabled>
                {tradeLoading ? 'Fetching LP Amount...' : 'Insufficient liquidity for this trade'}
              </RedGradientButton>
            ) : showApproveFlow ? (
              <RowBetween>
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approvalState !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approvalState === ApprovalState.APPROVED}
                  fontSize={20}
                >
                  {approvalState === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted && approvalState === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + currencies[Field.INPUT]?.symbol
                  )}
                </ButtonConfirmed>
                <ButtonError
                  fontSize={20}
                  onClick={() => {
                    // if (isExpertMode) {
                    handleZap()
                    // } else {
                    //   setSwapState({
                    //     tradeToConfirm: trade,
                    //     attemptingTxn: false,
                    //     swapErrorMessage: undefined,
                    //     showConfirm: true,
                    //     txHash: undefined
                    //   })
                    // }
                  }}
                  width="48%"
                  id="swap-button"
                  disabled={!isValid || approvalState !== ApprovalState.APPROVED}
                >
                  <Text fontSize={16} fontWeight={500}>
                    Zap
                  </Text>
                </ButtonError>
              </RowBetween>
            ) : insufficientBalanceError ? (
              <RedGradientButton id="swap-button" disabled>
                {zapInputError}
              </RedGradientButton>
            ) : (
              <ButtonError
                onClick={() => {
                  handleZap()
                  // setZapState({
                  //   tradeToConfirm: trade,
                  //   attemptingTxn: false,
                  //   swapErrorMessage: undefined,
                  //   showConfirm: true,
                  //   txHash: undefined
                  // })
                }}
                id="zap-button"
                disabled={!isValid /*|| !!swapCallbackError */}
                error={false /* &&  !swapCallbackError */}
              >
                <Text fontSize={20} fontWeight={500}>
                  {zapInputError ? zapInputError : 'Zap'}
                </Text>
              </ButtonError>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[approvalState === ApprovalState.APPROVED]} />
              </Column>
            )}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
    </>
  )
}

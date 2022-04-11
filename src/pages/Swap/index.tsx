import { CurrencyAmount, JSBI, Token, Trade } from '@jediswap/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Settings from '../../components/Settings'

import { ArrowDown } from 'react-feather'
// import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonError, ButtonConfirmed, ButtonEmpty, ButtonOutlined, ButtonPrimary } from '../../components/Button'
// import { ButtonLight } from '../../components/Button'
import { ButtonGradient, RedGradientButton } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
// import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import ProgressSteps from '../../components/ProgressSteps'

import { BETTER_TRADE_LINK_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import { useActiveStarknetReact } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
// import useENSAddress from '../../hooks/useENSAddress.ts'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
// import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useSwapDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks'
import { DMSansText, LinkStyledButton, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import {
  ClickableText,
  Backdrop,
  BalanceText,
  HeaderRow,
  IconWrapper,
  Icon,
  AddTokenRow,
  AddTokenText
} from './styleds'
import Loader from '../../components/Loader'
import { useAddressNormalizer } from '../../hooks/useAddressNormalizer'

import styled from 'styled-components'
import HeaderIcon from '../../assets/jedi/SwapPanel_headerItem.svg'
import SwapWidget from '../../assets/jedi/SwapWidget.svg'
import { jediTokensList } from '../../constants/jediTokens'
import { MintState, useMintCallback } from '../../hooks/useMintCallback'
import { useUserTransactionTTL } from '../../state/user/hooks'
import { ReactComponent as ArrowRight } from '../../assets/images/arrow-right-blue.svg'
import { useAddTokenToWallet } from '../../hooks/useAddTokenToWallet'
import { wrappedCurrency } from '../../utils/wrappedCurrency'

const MintSection = styled.section`
  margin-top: 3rem;
  max-width: 470px;
  width: 100%;
`

const MintButton = styled(ButtonOutlined)`
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 500;
  border-color: ${({ theme }) => theme.jediBlue};
  color: ${({ theme }) => theme.jediWhite};
`

export default function Swap() {
  const [ttl] = useUserTransactionTTL()
  const loadedUrlParams = useSwapDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ]

  // const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  // const urlLoadedTokens: Token[] = useMemo(
  //   () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
  //   [loadedInputCurrency, loadedOutputCurrency]
  // )
  // const handleConfirmTokenWarning = useCallback(() => {
  //   setDismissTokenWarning(true)
  // }, [])

  const [mintAddress, setMintAddress] = useState<string | undefined>(undefined)

  const { account, chainId } = useActiveStarknetReact()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    tradeLoading
  } = useDerivedSwapInfo()
  // const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
  //   currencies[Field.INPUT],
  //   currencies[Field.OUTPUT],
  //   typedValue
  // )
  // const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  // const { address: recipientAddress } = useENSAddress(recipient)

  const outputToken = wrappedCurrency(currencies[Field.OUTPUT], chainId)

  const addTokenToWallet = useAddTokenToWallet()

  const parsedAmounts = {
    [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
    [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
  }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

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

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const route = trade?.route

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  const [mintState, mintCallback] = useMintCallback()

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        // ReactGA.event({
        //   category: 'Swap',
        //   action:
        //     recipient === null
        //       ? 'Swap w/o Send'
        //       : (recipientAddress ?? recipient) === account
        //       ? 'Swap w/o Send + recipient'
        //       : 'Swap w/ Send',
        //   label: [trade?.inputAmount?.currency?.symbol, trade?.outputAmount?.currency?.symbol, Version.v2].join('/')
        // })
      })
      .catch(error => {
        console.error(error)
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [tradeToConfirm, priceImpactWithoutFee, showConfirm, swapCallback])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const insufficientBalanceError = swapInputError?.includes('balance')

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      handleTypeInput('')
    },
    [handleTypeInput, onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])

  const handleMint = useCallback(() => {
    // setMintAddress(tokenAddress)
    mintCallback().then(() => {
      console.log(`Minting ${mintAddress}`)
    })
  }, [mintAddress, mintCallback])

  // useEffect(() => {
  //   if (mintAddress && mintState === MintState.VALID) {
  //     mintCallback().then(() => {
  //       console.log(`Minting ${mintAddress}`)
  //       setMintAddress(undefined)
  //     })
  //   }
  // }, [mintAddress, mintCallback, mintState])

  return (
    <>
      {/* <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      /> */}
      <AppBody>
        <Backdrop top={'0'} left={'503px'} curveRight />
        <Backdrop top={'30px'} left={'493px'} curveRight style={{ height: '60px' }} />
        <Backdrop bottom={'30px'} left={'-35px'} curveLeft style={{ height: '60px' }} />
        <Backdrop bottom={'0px'} left={'-45px'} curveLeft />
        <SwapPoolTabs active={'swap'} />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />
          <div style={{ marginBottom: '30px' }}>
            <HeaderRow>
              SWAP
              {/* <Icon src={HeaderIcon} /> */}
              <Settings />
            </HeaderRow>
          </div>
          <HeaderRow>
            <BalanceText>Swap From</BalanceText>
            <BalanceText>Balance: {currencyBalances.INPUT?.toSignificant(6) ?? 0}</BalanceText>
          </HeaderRow>
          <AutoColumn>
            <CurrencyInputPanel
              // label={independentField === Field.OUTPUT && trade ? 'From (estimated)' : 'From'}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <IconWrapper
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                  >
                    <Icon noMargin unlimited src={SwapWidget} />
                  </IconWrapper>
                </ArrowWrapper>
                {recipient === null && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <HeaderRow
              style={
                currencyBalances.OUTPUT && currencyBalances.OUTPUT?.toSignificant(6).length > 10
                  ? { marginTop: '25px' }
                  : {}
              }
            >
              <BalanceText>Swap To (est.)</BalanceText>
              <BalanceText>Balance: {currencyBalances.OUTPUT?.toSignificant(6) ?? 0}</BalanceText>
            </HeaderRow>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              // label={independentField === Field.INPUT && trade ? 'To (estimated)' : 'To'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />

            {recipient !== null && (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            )}

            <Card padding={'17px 0'} borderRadius={'20px'}>
              <AutoColumn gap="10px">
                {Boolean(trade) && (
                  <RowBetween align="center">
                    <DMSansText.body fontSize={16}>Price</DMSansText.body>
                    <TradePrice trade={trade} showInverted={showInverted} setShowInverted={setShowInverted} />
                  </RowBetween>
                )}

                {Boolean(trade) && allowedSlippage && (
                  <RowBetween align="center">
                    <DMSansText.body fontSize={16}>Slippage Tolerance</DMSansText.body>
                    <DMSansText.body fontSize={16}>{allowedSlippage / 100}%</DMSansText.body>
                  </RowBetween>
                )}

                {Boolean(trade) && ttl && (
                  <RowBetween align="center">
                    <DMSansText.body fontSize={16}> Transaction Deadline</DMSansText.body>
                    <DMSansText.body fontSize={16}>{ttl / 60} mins.</DMSansText.body>
                  </RowBetween>
                )}
              </AutoColumn>
            </Card>
          </AutoColumn>
          <BottomGrouping marginTop={'0px'}>
            {!account ? (
              <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
            ) : noRoute && userHasSpecifiedInputOutput ? (
              <RedGradientButton style={{ textAlign: 'center' }} disabled>
                {tradeLoading ? 'Fetching route...' : 'Insufficient liquidity for this trade'}
              </RedGradientButton>
            ) : insufficientBalanceError ? (
              <RedGradientButton id="swap-button" disabled>
                {swapInputError}
              </RedGradientButton>
            ) : (
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                <Text>
                  {swapInputError
                    ? swapInputError
                    : priceImpactSeverity > 3 && !isExpertMode
                    ? `Price Impact Too High`
                    : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                </Text>
              </ButtonError>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          </BottomGrouping>

          {account && outputToken && (
            <AddTokenRow justify={'center'} onClick={() => addTokenToWallet(outputToken.address)}>
              <AddTokenText>Add {outputToken.symbol} to Wallet</AddTokenText>
              <ArrowRight width={16} height={15} style={{ marginBottom: '3.5px' }} />
            </AddTokenRow>
          )}
        </Wrapper>
      </AppBody>

      {account && (
        <MintSection>
          <AutoRow justify={'center'}>
            <AutoColumn style={{ margin: '6px' }}>
              <MintButton onClick={handleMint}> Mint Jedi Test Tokens </MintButton>
            </AutoColumn>
          </AutoRow>
        </MintSection>
      )}
      {/* TODO: FIX ADVANCED SWAP */}
      {/* <AdvancedSwapDetailsDropdown trade={trade} /> */}
    </>
  )
}

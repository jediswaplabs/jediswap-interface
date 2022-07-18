import React, { useCallback, useEffect, useState } from 'react'
import { TokenAmount, Trade } from '@jediswap/sdk'
import { useDispatch } from 'react-redux'
import ReactGA from 'react-ga4'

import { SwapPoolTabs } from '../../components/NavigationTabs'
import AppBody from '../AppBody'

import {
  Wrapper,
  HeaderRow,
  HeaderControlsPanel,
  HeaderControlsPanelSwitcher,
  HeaderControlsPanelSettings,
  HeaderDescription,
  HeaderNote
} from './styleds'

import Settings from '../../components/Settings'
import { AutoColumn } from '../../components/Column'

import { useUserSlippageTolerance } from '../../state/user/hooks'
import { useZapActionHandlers, useZapState } from '../../state/zap/hooks'
import { Field, Modes, reset as resetZapState } from '../../state/zap/actions'

import { computeTradePriceBreakdown } from '../../utils/prices'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import ConfirmZapModal from '../../components/Zap/ConfirmZapModal'
import ZapModeSwitcher from '../../components/Zap/ZapModeSwitcher'
import ZapInForm from '../../components/Zap/ZapInForm'
import ZapOutForm from '../../components/Zap/ZapOutForm'

const ZAP_MODES = {
  [Modes.IN]: {
    id: Modes.IN,
    name: 'Zap In',
    description: 'Zap IN helps you convert any of your tokens into LP tokens with 1-click'
  },
  [Modes.OUT]: {
    id: Modes.OUT,
    name: 'Zap Out',
    description: 'Zap OUT helps you withdraw your LP tokens into any single or multiple tokens with 1-click'
  }
}

const DEFAULT_ZAP_MODE_ID = Modes.IN

export default function Zap() {
  const [allowedSlippage] = useUserSlippageTolerance()
  const { recipient } = useZapState()
  const { onUserInput } = useZapActionHandlers()

  const dispatch = useDispatch()
  const [activeZapMode, setActiveZapMode] = useState<string>(DEFAULT_ZAP_MODE_ID)
  const [tokenAmountOut, setTokenAmountOut] = useState<TokenAmount | undefined>()
  const [tokenAmountIn, setTokenAmountIn] = useState<TokenAmount | undefined>()
  const [zapTrade, setZapTrade] = useState<Trade | undefined>()
  const [zapCallback, setZapCallback] = useState<(() => Promise<string>) | null>()

  // modal and loading
  const [{ showConfirm, tradeToConfirm, zapErrorMessage, attemptingTxn, txHash }, setZapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    zapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    zapErrorMessage: undefined,
    txHash: undefined
  })

  const handleZap = useCallback(() => {
    const { priceImpactWithoutFee } = computeTradePriceBreakdown(tradeToConfirm)
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!zapCallback) {
      return
    }
    setZapState({ attemptingTxn: true, tradeToConfirm, showConfirm, zapErrorMessage: undefined, txHash: undefined })
    zapCallback()
      .then(hash => {
        setZapState({ attemptingTxn: false, tradeToConfirm, showConfirm, zapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Zap',
          action: ZAP_MODES[activeZapMode].name,

          label: [zapTrade?.inputAmount?.currency?.symbol, tokenAmountOut?.currency?.symbol].join('/')
        })
      })
      .catch(error => {
        console.error(error)
        setZapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          zapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [
    showConfirm,
    tradeToConfirm,
    zapCallback,
    zapTrade?.inputAmount?.currency?.symbol,
    tokenAmountOut?.currency?.symbol
  ])

  const handleConfirmDismiss = useCallback(() => {
    setZapState({ showConfirm: false, tradeToConfirm, attemptingTxn, zapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, zapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setZapState({ tradeToConfirm: zapTrade, zapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, zapErrorMessage, zapTrade, txHash])

  const handleZapModeChange = useCallback(
    modeId => {
      dispatch(resetZapState())
      setActiveZapMode(modeId)
    },
    [setActiveZapMode]
  )

  const handleSubmit = useCallback(({ trade, callback, tokenAmountIn, tokenAmountOut }) => {
    setZapTrade(trade)
    setZapCallback(() => callback)
    setTokenAmountIn(tokenAmountIn)
    setTokenAmountOut(tokenAmountOut)

    setZapState({
      showConfirm: true,
      tradeToConfirm: trade,
      zapErrorMessage: undefined,
      attemptingTxn: false,
      txHash: undefined
    })
  }, [])

  return (
    <>
      <AppBody>
        <SwapPoolTabs active={'zap'} />
        <Wrapper>
          <ConfirmZapModal
            isOpen={showConfirm}
            trade={zapTrade}
            tokenAmountIn={tokenAmountIn}
            tokenAmountOut={tokenAmountOut}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleZap}
            zapErrorMessage={zapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap="14px" style={{ marginBottom: '18px' }}>
            <HeaderRow>
              <HeaderControlsPanel>
                <HeaderControlsPanelSwitcher>
                  <ZapModeSwitcher
                    modes={Object.values(ZAP_MODES)}
                    onChange={handleZapModeChange}
                    activeMode={activeZapMode}
                  />
                </HeaderControlsPanelSwitcher>
                <HeaderControlsPanelSettings>
                  <Settings />
                </HeaderControlsPanelSettings>
              </HeaderControlsPanel>
              <HeaderDescription fontSize={16}>{ZAP_MODES[activeZapMode].description}</HeaderDescription>
              <HeaderNote>WARNING: Zap can cause slippage. Small amounts only.</HeaderNote>
            </HeaderRow>
          </AutoColumn>
          {activeZapMode === Modes.IN && <ZapInForm onSubmit={handleSubmit} />}
          {activeZapMode === Modes.OUT && <ZapOutForm onSubmit={handleSubmit} />}
        </Wrapper>
      </AppBody>
    </>
  )
}

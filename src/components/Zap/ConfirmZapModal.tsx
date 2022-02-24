import { currencyEquals, TokenAmount, Trade } from '@jediswap/sdk'
import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import ZapModalFooter from './ZapModalFooter'
import ZapModalHeader from './ZapModalHeader'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from '../TransactionConfirmationModal'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

export default function ConfirmZapModal({
  trade,
  lpAmountOut,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  zapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash
}: {
  isOpen: boolean
  trade: Trade | undefined
  lpAmountOut: TokenAmount | undefined
  originalTrade: Trade | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: number
  onAcceptChanges: () => void
  onConfirm: () => void
  zapErrorMessage: string | undefined
  onDismiss: () => void
}) {
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const modalHeader = useCallback(() => {
    return trade ? (
      <ZapModalHeader
        trade={trade}
        lpAmountOut={lpAmountOut}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [allowedSlippage, lpAmountOut, onAcceptChanges, recipient, showAcceptChanges, trade])

  const modalBottom = useCallback(() => {
    return trade ? (
      <ZapModalFooter
        onConfirm={onConfirm}
        lpAmountOut={lpAmountOut}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        zapErrorMessage={zapErrorMessage}
        allowedSlippage={allowedSlippage}
      />
    ) : null
  }, [trade, onConfirm, lpAmountOut, showAcceptChanges, zapErrorMessage, allowedSlippage])

  // text to show while loading
  const pendingText = `Zapping ${trade?.inputAmount?.toSignificant(6)} ${
    trade?.inputAmount?.currency?.symbol
  } for ${lpAmountOut?.toSignificant(6)} ${lpAmountOut?.token.symbol}`

  const confirmationContent = useCallback(
    () =>
      zapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={zapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm Zap"
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, zapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
    />
  )
}

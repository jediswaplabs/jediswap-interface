import { LPToken, TokenAmount, Trade, TradeType } from '@jediswap/sdk'
import React, { useContext, useMemo } from 'react'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
// import { Field } from '../../state/swap/actions'
import { DMSansText, TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { isAddress, shortenAddress } from '../../utils'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
// import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { AutoColumn, ColumnCenter } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { TruncatedText, SwapShowAcceptChanges } from '../swap/styleds'

import styled from 'styled-components'
import DoubleCurrencyLogo from '../DoubleLogo'

const RowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3),
    inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
    inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  /* border-top-right-radius: 8px; */
  /* border-top-left-radius: 8px; */
  border-radius: 8px;
  width: 100%;
  padding: 13px 24px;
`
const ArrowWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${({ theme }) => theme.jediNavyBlue};
  color: ${({ theme }) => theme.jediWhite};
`
const ArrowBorder = styled.div`
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  position: absolute;
  width: max-content;
  padding: 2px;
  border-radius: 50%;
  background: linear-gradient(to top right, #50d5ff, #ef35ff);
`
const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`
const SwapText = styled(Text)`
  font-size: 14px;
  font-weight: 400;
`

export default function ZapModalHeader({
  trade,
  // allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
  lpAmountOut
}: {
  trade: Trade
  lpAmountOut: TokenAmount | undefined
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  // const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
  //   trade,
  //   allowedSlippage
  // ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap={'4px'} style={{ marginTop: '16px' }}>
      <RowWrapper>
        <Column>
          {/* <RowFixed>
            <SwapText>Swap From</SwapText>
          </RowFixed> */}
          <RowBetween>
            <RowFixed gap={'0px'}>
              <CurrencyLogo currency={trade.inputAmount.currency} size={'24px'} style={{ marginRight: '8px' }} />
              <DMSansText.body fontWeight={700} style={{ marginLeft: '0px' }}>
                {trade.inputAmount.currency.symbol}
              </DMSansText.body>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <TruncatedText
                fontSize={24}
                fontWeight={500}
                color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.primary1 : ''}
              >
                {trade.inputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
          </RowBetween>
        </Column>
      </RowWrapper>
      <RowFixed>
        <ArrowBorder>
          <ArrowWrapper>
            <ArrowDown size="16px" /*color={theme.text2}*/ style={{ /*marginLeft: '4px',*/ minWidth: '16px' }} />
          </ArrowWrapper>
        </ArrowBorder>
      </RowFixed>
      <RowWrapper style={{ padding: '24px' }}>
        <ColumnCenter>
          {/* <SwapText>Swap To</SwapText> */}
          <RowBetween align="flex-end">
            <RowFixed gap={'0px'}>
              {lpAmountOut?.token instanceof LPToken ? (
                <DoubleCurrencyLogo
                  currency0={lpAmountOut.token.token0}
                  currency1={lpAmountOut.token.token1}
                  size={18}
                />
              ) : (
                <CurrencyLogo currency={trade.outputAmount.currency} size={'18px'} />
              )}
              <DMSansText.body fontSize={16} fontWeight={700} style={{ marginLeft: '8px' }}>
                {lpAmountOut?.currency.symbol?.split('-').join(' / ')}
              </DMSansText.body>
            </RowFixed>
            <RowFixed gap={'0px'}>
              <TruncatedText
                fontSize={20}
                fontWeight={500}
                color={
                  priceImpactSeverity > 2
                    ? theme.red1
                    : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                    ? theme.primary1
                    : ''
                }
              >
                {lpAmountOut?.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
          </RowBetween>
        </ColumnCenter>
      </RowWrapper>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <DMSansText.main color={theme.jediWhite}> Price Updated</DMSansText.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem' }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}

      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}

import { Trade, TradeType } from '@jediswap/sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
// import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity
} from '../../utils/prices'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
// import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'

import styled from 'styled-components'

const Wrapper = styled.div`
  background: rgba(196, 196, 196, 0.01);
  box-shadow: inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3),
    inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
    inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  border-radius: 8px;
  color: ${({ theme }) => theme.jediWhite};

  font-size: 14px;

  font-weight: 400;
  line-height: 14px;
  letter-spacing: 0em;
  text-align: left;
  position: relative;
`
const ButtonWrapepr = styled.div`
  margin-bottom: 24px;
  width: 100%;
`
const GradientBreakLine = styled.div`
  background: linear-gradient(to left, #50d5ff, #ef35ff);
  height: 1px;
  width: 100%;
`
const Padding = styled.div`
  padding: 16px 24px;
`
export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  // const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)

  return (
    <>
      <RowBetween align="center" style={{ marginBottom: '12px' }}>
        <Text fontWeight={400} fontSize={16} /*color={theme.text2}*/>
          Price
        </Text>
        <Text
          fontWeight={400}
          fontSize={16}
          // color={theme.text1}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            textAlign: 'right',
            paddingLeft: '10px'
          }}
        >
          {formatExecutionPrice(trade, showInverted)}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <Repeat size={14} />
          </StyledBalanceMaxMini>
        </Text>
      </RowBetween>

      <Wrapper>
        <Padding>
          <RowFixed>
            <TYPE.white fontSize={16} fontWeight={700}>
              Transaction Details
            </TYPE.white>
          </RowFixed>
        </Padding>
        <GradientBreakLine />
        <Padding>
          <AutoColumn gap="20px">
            <RowBetween>
              <RowFixed>
                <TYPE.white fontSize={14} fontWeight={400} /*color={theme.text2}*/>
                  Liquidity Provider Fee
                </TYPE.white>
                {/* <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." /> */}
              </RowFixed>
              <TYPE.white fontSize={14} fontWeight={400}>
                {realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.symbol : '-'}
              </TYPE.white>
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <TYPE.white /*color={theme.text2}*/ fontSize={14} fontWeight={400}>
                  Price Impact
                </TYPE.white>
                {/* <QuestionHelper text="The difference between the market price and your price due to trade size." /> */}
              </RowFixed>
              <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <TYPE.white /*color={theme.text2}*/ fontSize={14} fontWeight={400}>
                  Allowed Slippage
                </TYPE.white>
                {/* <QuestionHelper text="The difference between the market price and your price due to trade size." /> */}
              </RowFixed>
              {/* <FormattedPriceImpact priceImpact={priceImpactWithoutFee} /> */}
              <TYPE.white fontSize={14} fontWeight={400}>
                0.50%
              </TYPE.white>
            </RowBetween>

            <RowBetween>
              <RowFixed>
                <TYPE.white fontSize={14} fontWeight={400} /*color={theme.text2}*/>
                  {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
                </TYPE.white>
                {/* <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." /> */}
              </RowFixed>
              <RowFixed>
                <TYPE.white fontSize={14} fontWeight={400}>
                  {trade.tradeType === TradeType.EXACT_INPUT
                    ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                    : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
                </TYPE.white>
                <TYPE.white fontSize={14} marginLeft={'4px'} fontWeight={400}>
                  {trade.tradeType === TradeType.EXACT_INPUT
                    ? trade.outputAmount.currency.symbol
                    : trade.inputAmount.currency.symbol}
                </TYPE.white>
              </RowFixed>
            </RowBetween>
          </AutoColumn>
        </Padding>
      </Wrapper>
      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '3px 0 0 0px' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <TYPE.white textAlign="left" style={{ width: '100%', fontSize: '14px', fontWeight: 400 }}>
            {`Output is estimated. You will receive at least `}
            <b>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.white>
        ) : (
          <TYPE.white textAlign="left" style={{ width: '100%' }}>
            {`Input is estimated. You will sell at most `}
            <b>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.white>
        )}
      </AutoColumn>
      <AutoRow>
        <ButtonWrapepr>
          <ButtonError
            onClick={onConfirm}
            disabled={disabledConfirm}
            error={severity > 2}
            style={{ margin: '10px 0 0 0' }}
            id="confirm-swap-or-send"
          >
            <Text fontSize={20} fontWeight={500}>
              {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
            </Text>
          </ButtonError>
        </ButtonWrapepr>
        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}

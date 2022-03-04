import { TokenAmount, Trade, TradeType } from '@jediswap/sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { TYPE } from '../../theme'
import {
  computeSlippageAdjustedAmounts,
  computeSlippageAdjustedLPAmount,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  formatZapExecutionPrice,
  warningSeverity
} from '../../utils/prices'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
// import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from '../swap/FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError, TruncatedText } from '../swap/styleds'

import styled from 'styled-components'
import { basisPointsToPercent } from '../../utils'

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
  text-align: left;
  position: relative;
`
const ButtonWrapper = styled.div`
  margin-bottom: 16px;
  width: 100%;
`
const GradientBreakLine = styled.div`
  background: linear-gradient(to left, #50d5ff, #ef35ff);
  height: 1px;
  width: 100%;
`
const Padding = styled.div`
  padding: 12px 24px;
`
export default function ZapModalFooter({
  trade,
  lpAmountOut,
  onConfirm,
  allowedSlippage,
  zapErrorMessage,
  disabledConfirm
}: {
  trade: Trade
  lpAmountOut: TokenAmount | undefined
  allowedSlippage: number
  onConfirm: () => void
  zapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  // const theme = useContext(ThemeContext)

  const slippagePct = useMemo(() => basisPointsToPercent(allowedSlippage), [allowedSlippage])

  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedLPAmount(lpAmountOut, allowedSlippage), [
    allowedSlippage,
    lpAmountOut
  ])

  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)

  return (
    <>
      <RowBetween align="center">
        <Text fontWeight={400} fontSize={16} /*color={theme.text2}*/>
          Price
        </Text>
        <TruncatedText
          fontWeight={400}
          fontSize={16}
          // color={theme.text1}
          style={{
            textAlign: 'right',
            paddingLeft: '10px',
            cursor: 'pointer',
            maxWidth: '70%',
            whiteSpace: 'nowrap'
          }}
          onClick={() => setShowInverted(!showInverted)}
        >
          {formatZapExecutionPrice(trade, lpAmountOut, showInverted)}
          {/* <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <Repeat size={14} />
          </StyledBalanceMaxMini> */}
        </TruncatedText>
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
          <AutoColumn gap="12px">
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
                {slippagePct.toFixed(2)}%
              </TYPE.white>
            </RowBetween>

            <RowBetween>
              <RowFixed>
                <TYPE.white fontSize={14} fontWeight={400} /*color={theme.text2}*/>
                  Minimum received
                </TYPE.white>
                {/* <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." /> */}
              </RowFixed>
              <RowFixed>
                <TYPE.white fontSize={14} fontWeight={400}>
                  {slippageAdjustedAmounts?.toSignificant(4) ?? '-'}
                </TYPE.white>
                <TYPE.white fontSize={14} marginLeft={'4px'} fontWeight={400}>
                  {lpAmountOut?.currency.symbol?.split('-').join('/')}
                </TYPE.white>
              </RowFixed>
            </RowBetween>
          </AutoColumn>
        </Padding>
      </Wrapper>
      <AutoColumn justify="flex-start" gap="sm">
        <TYPE.white textAlign="left" style={{ width: '100%', fontSize: '14px', fontWeight: 400 }}>
          {`Output is estimated. You will receive at least `}
          <b>
            {slippageAdjustedAmounts?.toSignificant(6)} {lpAmountOut?.currency.symbol?.split('-').join('/')}
          </b>
          {' or the transaction will revert.'}
        </TYPE.white>
      </AutoColumn>
      <AutoRow>
        <ButtonWrapper>
          <ButtonError onClick={onConfirm} disabled={disabledConfirm} error={severity > 2} id="confirm-zap-or-send">
            <Text fontSize={20} fontWeight={500}>
              {severity > 2 ? 'Zap Anyway' : 'Confirm Zap'}
            </Text>
          </ButtonError>
        </ButtonWrapper>
        {zapErrorMessage ? <SwapCallbackError error={zapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}

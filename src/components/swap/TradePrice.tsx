import React from 'react'
import { Price, Trade } from '@jediswap/sdk'
import { useContext } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { StyledBalanceMaxMini } from './styleds'
import { formatExecutionPrice } from '../../utils/prices'

interface TradePriceProps {
  trade?: Trade
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice({ trade, showInverted, setShowInverted }: TradePriceProps) {
  const theme = useContext(ThemeContext)

  // const formattedPrice = showInverted ? price?.toSignificant(5) : price?.invert()?.toSignificant(5)

  const show = Boolean(trade?.executionPrice?.baseCurrency && trade?.executionPrice?.quoteCurrency)
  // const label = showInverted
  //   ? `${price?.quoteCurrency?.symbol} per ${price?.baseCurrency?.symbol}`
  //   : `${price?.baseCurrency?.symbol} per ${price?.quoteCurrency?.symbol}`

  const formattedPrice = formatExecutionPrice(trade, showInverted, '=')

  return (
    <Text
      fontFamily={'DM Sans'}
      fontWeight={500}
      fontSize={14}
      color={theme.text2}
      style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}
      letterSpacing={'0px'}
    >
      {show ? (
        <>
          {formattedPrice ?? '-'}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <Repeat size={14} />
          </StyledBalanceMaxMini>
        </>
      ) : (
        '-'
      )}
    </Text>
  )
}

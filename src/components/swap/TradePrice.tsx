import React from 'react'
import { Price, Trade } from '@jediswap/sdk'
import { useContext } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { StyledBalanceMaxMini } from './styleds'
import { formatExecutionPrice } from '../../utils/prices'
import { DMSansText } from '../../theme'
import { Icon } from '../../pages/Swap/styleds'
import PriceInverter from '../../assets/jedi/PriceInverter.svg'

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
    <DMSansText.body fontSize={14} style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
      {show ? (
        <>
          {formattedPrice ?? '-'}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <Icon src={PriceInverter} noMargin />
          </StyledBalanceMaxMini>
        </>
      ) : (
        '-'
      )}
    </DMSansText.body>
  )
}

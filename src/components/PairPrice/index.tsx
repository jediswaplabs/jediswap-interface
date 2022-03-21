import React from 'react'
import { Price, Trade, Pair } from '@jediswap/sdk'
import { useContext } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { StyledBalanceMaxMini } from '../swap/styleds'
import { formatExecutionPrice, formatPairExecutionPrice } from '../../utils/prices'
import { DMSansText } from '../../theme'
import { Icon } from '../../pages/Swap/styleds'
import PriceInverter from '../../assets/jedi/PriceInverter.svg'

interface PairPriceProps {
  pair?: Pair
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function PairPrice({ pair, showInverted, setShowInverted }: PairPriceProps) {
  // const formattedPrice = showInverted ? price?.toSignificant(5) : price?.invert()?.toSignificant(5)

  const show = Boolean(pair?.token0 && pair?.token1)
  // const label = showInverted
  //   ? `${price?.quoteCurrency?.symbol} per ${price?.baseCurrency?.symbol}`
  //   : `${price?.baseCurrency?.symbol} per ${price?.quoteCurrency?.symbol}`

  const formattedPrice = formatPairExecutionPrice(pair, showInverted, '=')

  return (
    <DMSansText.body fontSize={16} style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
      {show ? (
        <>
          {formattedPrice ?? '-'}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <Icon src={PriceInverter} noMargin height={18} width={18} />
          </StyledBalanceMaxMini>
        </>
      ) : (
        '-'
      )}
    </DMSansText.body>
  )
}

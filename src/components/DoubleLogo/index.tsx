import { Currency } from '@jediswap/sdk'
import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogo'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
}

const HigherLogoDiv = styled.div`
  z-index: 2;
`
const CoveredLogoDiv = styled.div<{ sizeraw: number }>`
  position: absolute;
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 16,
  margin = false
}: DoubleCurrencyLogoProps) {
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {currency0 && (
        <HigherLogoDiv>
          <CurrencyLogo currency={currency0} size={size.toString() + 'px'} filled={true} />
        </HigherLogoDiv>
      )}
      {currency1 && (
        <CoveredLogoDiv sizeraw={size}>
          <CurrencyLogo currency={currency1} size={size.toString() + 'px'} filled={true} />
        </CoveredLogoDiv>
      )}
    </Wrapper>
  )
}

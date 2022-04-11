import { Currency, ETHER, Token } from '@jediswap/sdk'
import React, { useMemo } from 'react'
import { number } from 'starknet'
import styled from 'styled-components'

// import EthereumLogo from '../../assets/images/ethereum-logo.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../Logo'

// const getTokenLogoURL = (address: string) =>
//   `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)`
  border-radius: ${({ size }) => size + 'px'};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  color: white;
`

export default function CurrencyLogo({
  currency,
  size = 30,
  style,
  filled = false
}: {
  currency?: Currency
  size?: number
  style?: React.CSSProperties
  filled?: boolean
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations]
      }

      return []
    }
    return []
  }, [currency, uriLocations])

  // if (currency === ETHER) {
  //   return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  // }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}

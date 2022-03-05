import { JSBI, Pair, Percent } from '@jediswap/sdk'
import { darken } from 'polished'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveStarknetReact } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { DMSansText } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonEmpty, ButtonGradient } from '../Button'
import { transparentize } from 'polished'
import noise from '../../assets/images/noise.png'

import { useColor } from '../../hooks/useColor'

import Card, { LightCard, WhiteOutlineCard, JediPositionCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const CardNoise = styled.span`
  background: url(${noise});
  background-size: cover;
  mix-blend-mode: overlay;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: ${({ theme, bgColor }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(0.8, bgColor)} 0%, ${theme.bg3} 100%) `};
  position: relative;
  overflow: hidden;
`

const CardText = styled.div<{
  textAlign?: string
  fontWeight?: number
  fontSize?: number
  lineHeight?: string
  fontColor?: string
}>`
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0px;
  color: ${({ fontColor, theme }) => (fontColor ? fontColor : theme.jediWhite)};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : 'normal')};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '14px')};
  line-height: ${({ lineHeight }) => (lineHeight ? lineHeight : '140%')};
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'center')};
`

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
  const { connectedAddress } = useActiveStarknetReact()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(connectedAddress ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <WhiteOutlineCard border={border} borderRadius={'8px'} padding={'16px'}>
          <AutoColumn gap="12px">
            <FixedHeightRow>
              <RowFixed>
                <CardText fontWeight={500} fontSize={18} lineHeight={'120%'}>
                  Your position
                </CardText>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow onClick={() => setShowMore(!showMore)}>
              <RowFixed>
                <div style={{ marginRight: '8px' }}>
                  <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
                </div>
                <CardText fontWeight={700} fontSize={18} lineHeight={'100%'}>
                  {currency0.symbol}/{currency1.symbol}
                </CardText>
              </RowFixed>
              <RowFixed>
                <CardText fontWeight={700} fontSize={18} lineHeight={'100%'}>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </CardText>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="4px" style={{ marginTop: '-4px' }}>
              <FixedHeightRow>
                <CardText fontSize={16} fontWeight={500} lineHeight={'120%'}>
                  Your pool share:
                </CardText>
                <CardText fontSize={16} fontWeight={500} lineHeight={'120%'}>
                  {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
                </CardText>
              </FixedHeightRow>
              <FixedHeightRow>
                <CardText fontSize={16} fontWeight={500} lineHeight={'120%'}>
                  {currency0.symbol}:
                </CardText>
                {token0Deposited ? (
                  <RowFixed>
                    <CardText fontSize={16} fontWeight={500} lineHeight={'120%'} style={{ marginLeft: '6px' }}>
                      {token0Deposited?.toSignificant(6)}
                    </CardText>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <CardText fontSize={16} fontWeight={500}>
                  {currency1.symbol}:
                </CardText>
                {token1Deposited ? (
                  <RowFixed>
                    <CardText fontSize={16} fontWeight={500} style={{ marginLeft: '6px' }}>
                      {token1Deposited?.toSignificant(6)}
                    </CardText>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
        </WhiteOutlineCard>
      ) : (
        <WhiteOutlineCard padding={'12px'} borderRadius={'8px'}>
          <CardText textAlign="left">
            <span role="img" aria-label="wizard-icon">
              ⭐️
            </span>{' '}
            By adding liquidity you&apos;ll earn 0.3% of all trades on this pair proportional to your share of the pool.
            Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
          </CardText>
        </WhiteOutlineCard>
      )}
    </>
  )
}

export default function FullPositionCard({ pair, border }: PositionCardProps) {
  const { connectedAddress } = useActiveStarknetReact()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(connectedAddress ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const backgroundColor = useColor(pair?.token0)

  return (
    <JediPositionCard /*style={{ cursor: 'pointer' }}*/ border={border}>
      <CardNoise />
      <AutoColumn gap="16px">
        <ButtonEmpty padding="0" width="100%" onClick={() => setShowMore(!showMore)}>
          <FixedHeightRow>
            <RowFixed>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
              <DMSansText.mediumHeader>
                {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol} / ${currency1.symbol}`}
              </DMSansText.mediumHeader>
            </RowFixed>

            <RowFixed gap="8px">
              {/* <ButtonEmpty
              padding="6px 8px"
              borderRadius="12px"
              width="fit-content"
              onClick={() => setShowMore(!showMore)}
            > */}
              {showMore ? (
                <>
                  {' '}
                  Manage
                  <ChevronUp size="20" /*style={{ marginLeft: '10px' }}*/ />
                </>
              ) : (
                <>
                  Manage
                  <ChevronDown size="20" /*style={{ marginLeft: '10px' }}*/ />
                </>
              )}
              {/* </ButtonEmpty> */}
            </RowFixed>
          </FixedHeightRow>
        </ButtonEmpty>

        {showMore && (
          <AutoColumn gap="10px">
            <FixedHeightRow>
              <DMSansText.mediumBody>Your pool tokens:</DMSansText.mediumBody>
              <DMSansText.mediumBody>{userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}</DMSansText.mediumBody>
            </FixedHeightRow>
            <FixedHeightRow>
              <RowFixed>
                <DMSansText.mediumBody>Pooled {currency0.symbol}:</DMSansText.mediumBody>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <DMSansText.mediumBody marginLeft={'6px'}>{token0Deposited?.toSignificant(6)}</DMSansText.mediumBody>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <RowFixed>
                <DMSansText.mediumBody>Pooled {currency1.symbol}:</DMSansText.mediumBody>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <DMSansText.mediumBody marginLeft={'6px'}>{token1Deposited?.toSignificant(6)}</DMSansText.mediumBody>
                  <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <DMSansText.mediumBody>Your pool share:</DMSansText.mediumBody>
              <DMSansText.mediumBody>
                {poolTokenPercentage ? poolTokenPercentage.toSignificant(6) + '%' : '-'}
              </DMSansText.mediumBody>
            </FixedHeightRow>
            <RowBetween marginTop="15px">
              <ButtonGradient
                borderRadius="8px"
                as={Link}
                to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                width="48%"
                style={{ padding: '12px 8px' }}
              >
                Add
              </ButtonGradient>
              <ButtonGradient
                borderRadius="8px"
                as={Link}
                width="48%"
                to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                style={{ padding: '12px 8px' }}
              >
                Remove
              </ButtonGradient>
            </RowBetween>
          </AutoColumn>
        )}
      </AutoColumn>
    </JediPositionCard>
  )
}

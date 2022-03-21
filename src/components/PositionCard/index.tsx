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
import { ButtonEmpty, ButtonGradient, ButtonPrimary } from '../Button'
import { transparentize } from 'polished'
import noise from '../../assets/images/noise.png'

import { useColor } from '../../hooks/useColor'

import Card, { LightCard, WhiteOutlineCard, JediPositionCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed } from '../Row'
import { Dots } from '../swap/styleds'
import { Separator } from '../../pages/Pool/styleds'

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
  color: ${({ fontColor, theme }) => (fontColor ? fontColor : theme.jediWhite)};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : 'normal')};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '14px')};
  line-height: ${({ lineHeight }) => (lineHeight ? lineHeight : '140%')};
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'center')};
`

const ManageText = styled.div`
  font-weight: 800;
  font-size: 16px;
  line-height: 20px;
  font-feature-settings: 'salt' on, 'liga' off;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const AddRemoveButton = styled(ButtonPrimary)`
  font-size: 24px;
  line-height: 20px;
  font-weight: 800;
  border-radius: 8px;
  padding: 22px;
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
        <WhiteOutlineCard border={border} borderRadius={'8px'} padding={'12px 32px'}>
          <AutoColumn gap="12px">
            <FixedHeightRow>
              <RowFixed>
                <CardText fontWeight={700} fontSize={18} lineHeight={'100%'}>
                  Your position
                </CardText>
              </RowFixed>
            </FixedHeightRow>

            <Separator style={{ margin: '0px -32px' }} />

            <FixedHeightRow>
              <RowFixed>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} margin={true} />

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
                <CardText fontSize={16} fontWeight={500} lineHeight={'100%'}>
                  Your pool share:
                </CardText>
                <CardText fontSize={16} fontWeight={500} lineHeight={'100%'}>
                  {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
                </CardText>
              </FixedHeightRow>
              <FixedHeightRow>
                <CardText fontSize={16} fontWeight={500} lineHeight={'100%'}>
                  {currency0.symbol}:
                </CardText>
                {token0Deposited ? (
                  <RowFixed>
                    <CardText fontSize={16} fontWeight={500} lineHeight={'100%'} style={{ marginLeft: '6px' }}>
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
          <CardText fontSize={15} textAlign="left">
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
      <AutoColumn gap="48px">
        <ButtonEmpty padding="0" width="100%" onClick={() => setShowMore(!showMore)}>
          <FixedHeightRow>
            <RowFixed>
              <div style={{ color: 'white' }}>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={25} />
              </div>
              <DMSansText.mediumHeader>
                {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol} / ${currency1.symbol}`}
              </DMSansText.mediumHeader>
            </RowFixed>

            <RowFixed gap="4px">
              {/* <ButtonEmpty
              padding="6px 8px"
              borderRadius="12px"
              width="fit-content"
              onClick={() => setShowMore(!showMore)}
            > */}

              <>
                <ManageText>Manage</ManageText>
                {showMore ? <ChevronUp size="25" /> : <ChevronDown size="25" />}
              </>

              {/* </ButtonEmpty> */}
            </RowFixed>
          </FixedHeightRow>
        </ButtonEmpty>

        {showMore && (
          <AutoColumn gap="14px">
            <RowBetween>
              <DMSansText.body fontSize={18}>Your pool tokens:</DMSansText.body>
              <DMSansText.body fontSize={18}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
              </DMSansText.body>
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <DMSansText.body fontSize={18}>Pooled {currency0.symbol}:</DMSansText.body>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <DMSansText.body fontSize={18} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6)}
                  </DMSansText.body>

                  <CurrencyLogo size={25} style={{ marginLeft: '8px' }} currency={currency0} />
                </RowFixed>
              ) : (
                '-'
              )}
            </RowBetween>

            <RowBetween>
              <RowFixed>
                <DMSansText.body fontSize={18}>Pooled {currency1.symbol}:</DMSansText.body>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <DMSansText.body fontSize={18} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                  </DMSansText.body>

                  <CurrencyLogo size={25} style={{ marginLeft: '8px' }} currency={currency1} />
                </RowFixed>
              ) : (
                '-'
              )}
            </RowBetween>

            <RowBetween>
              <DMSansText.body fontSize={18}>Your pool share:</DMSansText.body>
              <DMSansText.body fontSize={18}>
                {poolTokenPercentage ? poolTokenPercentage.toSignificant(6) + '%' : '-'}
              </DMSansText.body>
            </RowBetween>
            <RowBetween marginTop="15px">
              <AddRemoveButton as={Link} to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`} width="48%">
                Add Liquidity
              </AddRemoveButton>
              <AddRemoveButton as={Link} width="48%" to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}>
                Remove Liquidity
              </AddRemoveButton>
            </RowBetween>
          </AutoColumn>
        )}
      </AutoColumn>
    </JediPositionCard>
  )
}

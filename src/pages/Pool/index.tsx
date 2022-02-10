import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair } from '@jediswap/sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { StyledInternalLink, ExternalLink, TYPE, HideSmall, DMSansText } from '../../theme'
import { Text } from 'rebass'
import Card from '../../components/Card'
import Row, { RowBetween, RowFixed } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'

import { useActiveStarknetReact } from '../../hooks'
import { PairState, usePairs, useTokenPairsWithLiquidityTokens } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { Dots } from '../../components/swap/styleds'
import { CardSection, DataCard, CardNoise, CardBGImage } from './styleds'
import { Wrapper } from '../ComingSoon'

const PageWrapper = styled(AutoColumn)`
  max-width: 900px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const LiquidityWrapperCard = styled(DataCard)`
  background: transparent;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.jediBlue};
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0px;
  box-shadow: inset 0px 30.0211px 0.1072px -27.7118px rgba(255, 255, 255, 0.5),
    inset 0px 5.38841px 8.46749px -3.07909px #ffffff, inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3),
    inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
    inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  backdrop-filter: blur(76.9772px);
  border-radius: 16px;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const CreatePoolButton = styled(ResponsiveButtonSecondary)`
  padding: 9px 27px;
  border: 2px solid ${({ theme }) => theme.jediWhite};
  font-size: 16px;
  line-height: 20px;
  letter-spacing: -3px;
  color: ${({ theme }) => theme.jediWhite};
  border-radius: 8px;

  :hover {
    border: 2px solid ${({ theme }) => theme.jediBlue};
    /* color: ${({ theme }) => theme.jediBlue}; */
  }
`

const CreatePoolButtonAlt = styled(CreatePoolButton)`
  font-size: 24px;
  line-height: 30px;
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const ComingSoonSection = styled(Row)`
  font-size: 36px;
  justify-content: center;
`

// const

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account } = useActiveStarknetReact()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  // console.log('🚀 ~ file: index.tsx ~ line 108 ~ Pool ~ trackedTokenPairs', trackedTokenPairs)
  // const [p]

  const [tokenPairsWithLiquidityTokens, liquidityTokenLoading] = useTokenPairsWithLiquidityTokens(trackedTokenPairs)

  // const tokenPairsWithLiquidityTokens = useMemo(
  //   () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
  //   [trackedTokenPairs]
  // )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [pairsBalances, fetchingPairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  console.log(
    '🚀 ~ file: index.tsx ~ line 88 ~ Pool ~ pairsBalances, fetchingPairBalances',
    pairsBalances,
    fetchingPairBalances
  )
  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(
        ({ liquidityToken }) => liquidityToken && pairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, pairsBalances]
  )

  const pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  console.log('🚀 ~ file: index.tsx ~ line 140 ~ Pool ~ pairs', pairs)
  const pairIsLoading =
    liquidityTokenLoading ||
    fetchingPairBalances ||
    pairs?.length < liquidityTokensWithBalances.length ||
    pairs?.some(([pairState]) => pairState === PairState.LOADING) ||
    pairs?.some(pair => !pair)

  // console.log('🚀 ~ file: index.tsx ~ line 141 ~ Pool ~ pairIsLoading', pairIsLoading)

  console.log('Pairs: ', pairs, 'isPairLoading: ', pairIsLoading)

  const allPairsWithLiquidity = pairs
    .map(([, pair]) => pair)
    .filter((tokenPair): tokenPair is Pair => Boolean(tokenPair))
  console.log('🚀 ~ file: index.tsx ~ line 152 ~ Pool ~ allPairsWithLiquidity', allPairsWithLiquidity)

  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active={'pool'} />

        <LiquidityWrapperCard>
          {/* <CardBGImage />
        <CardNoise /> */}
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <DMSansText.mediumHeader fontWeight={700}>Liquidity provider rewards</DMSansText.mediumHeader>
              </RowBetween>
              <RowBetween>
                <DMSansText.body fontSize={15}>
                  {`Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
                </DMSansText.body>
              </RowBetween>
              {/* <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                target="_blank"
                href="https://uniswap.org/docs/v2/core-concepts/pools/"
              >
                <TYPE.white fontSize={14}>Read more about providing liquidity</TYPE.white>
              </ExternalLink> */}
            </AutoColumn>
          </CardSection>
          {/* <CardBGImage /> */}
          {/* <CardNoise /> */}
        </LiquidityWrapperCard>

        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow style={{ marginTop: '1.5rem' }} padding={'0'}>
              <HideSmall>
                <TYPE.mediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
                  Your liquidity
                </TYPE.mediumHeader>
              </HideSmall>
              <ButtonRow>
                {/* <ResponsiveButtonSecondary as={Link} padding="6px 8px" to="/create/ETH">
                  Create a pair
                </ResponsiveButtonSecondary> */}
                <CreatePoolButton id="join-pool-button" as={Link} padding="6px 8px" to="/add/TOKEN0">
                  <Text fontWeight={500} fontSize={16}>
                    Add Liquidity
                  </Text>
                </CreatePoolButton>
              </ButtonRow>
            </TitleRow>

            {!account ? (
              <Card padding="40px">
                <TYPE.body color={theme.jediBlue} textAlign="center">
                  Connect to a wallet to view your liquidity
                </TYPE.body>
              </Card>
            ) : pairIsLoading ? (
              <EmptyProposals>
                <TYPE.body color={theme.jediBlue} textAlign="center">
                  <Dots>Loading</Dots>
                </TYPE.body>
              </EmptyProposals>
            ) : allPairsWithLiquidity?.length > 0 ? (
              <>
                {/* <ButtonSecondary>
                  <RowBetween>
                    <ExternalLink href={'https://uniswap.info/account/' + account}>
                      Account analytics and accrued fees
                    </ExternalLink>
                    <span> ↗</span>
                  </RowBetween>
                </ButtonSecondary> */}

                {allPairsWithLiquidity.map(v2Pair => (
                  <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                ))}
              </>
            ) : (
              <EmptyProposals>
                <TYPE.body color={theme.jediBlue} textAlign="center">
                  No liquidity found
                </TYPE.body>
              </EmptyProposals>
            )}

            {/* <AutoColumn justify={'center'} gap="md">
              <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
                {hasV1Liquidity ? 'Uniswap V1 liquidity found!' : "Don't see a pool you joined?"}{' '}
                <StyledInternalLink id="import-pool-link" to={hasV1Liquidity ? '/migrate/v1' : '/find'}>
                  {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}
                </StyledInternalLink>
              </Text>
            </AutoColumn> */}
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )

  // return (
  //   <Wrapper>
  //     <ButtonRow>
  //       <CreatePoolButtonAlt as={Link} to="/add/TOKEN0">
  //         Add Liquidity
  //       </CreatePoolButtonAlt>
  //     </ButtonRow>
  //   </Wrapper>
  // )
}

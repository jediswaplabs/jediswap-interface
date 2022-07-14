import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair } from '@jediswap/sdk'
import { Link } from 'react-router-dom'
import { JediSwapTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { TYPE, HideSmall, DMSansText } from '../../theme'
import { Text } from 'rebass'
import Card from '../../components/Card'
import Row, { RowBetween, RowFixed } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveStarknetReact } from '../../hooks'
import { PairState, usePairs } from '../../data/Reserves'
import { getLiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { Dots } from '../../components/swap/styleds'
import { CardSection, DataCard, CardNoise, CardBGImage } from './styleds'
import { useAllPairs } from '../../state/pairs/hooks'

const PageWrapper = styled(AutoColumn)`
  max-width: 900px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const LiquidityWrapperCard = styled(DataCard)`
  background: ${({ theme }) => theme.jediNavyBlue};
  overflow: hidden;
  border: none;
  border-radius: 8px;
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
  gap: 14px;
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
  color: ${({ theme }) => theme.jediWhite};
  border-radius: 8px;
  text-transform: uppercase;

  :hover {
    border: 2px solid ${({ theme }) => theme.jediBlue};
    /* color: ${({ theme }) => theme.jediBlue}; */
  }
`

const CreatePoolButtonAlt = styled(CreatePoolButton)`
  font-size: 18px;
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
  const { account, connectedAddress } = useActiveStarknetReact()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  // console.log('🚀 ~ file: index.tsx ~ line 108 ~ Pool ~ trackedTokenPairs', trackedTokenPairs)
  // const [p]

  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: getLiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )

  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])

  const allPairs = useAllPairs()

  const validatedLiquidityTokens = useMemo(
    () => liquidityTokens.map(token => (allPairs.includes(token.address) ? token : undefined)),
    [allPairs, liquidityTokens]
  )

  const [pairsBalances, fetchingPairBalances] = useTokenBalancesWithLoadingIndicator(
    connectedAddress ?? undefined,
    validatedLiquidityTokens
  )

  // console.log(
  //   '🚀 ~ file: index.tsx ~ line 88 ~ Pool ~ pairsBalances, fetchingPairBalances',
  //   pairsBalances,
  //   fetchingPairBalances
  // )
  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(
        ({ liquidityToken }) => liquidityToken && pairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, pairsBalances]
  )

  const pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  // console.log('🚀 ~ file: index.tsx ~ line 140 ~ Pool ~ pairs', pairs)
  const pairIsLoading =
    fetchingPairBalances ||
    pairs?.length < liquidityTokensWithBalances.length ||
    pairs?.some(([pairState]) => pairState === PairState.LOADING) ||
    pairs?.some(pair => !pair)

  // console.log('🚀 ~ file: index.tsx ~ line 141 ~ Pool ~ pairIsLoading', pairIsLoading)

  // console.log('Pairs: ', pairs, 'isPairLoading: ', pairIsLoading)

  const allPairsWithLiquidity = pairs
    .map(([, pair]) => pair)
    .filter((tokenPair): tokenPair is Pair => Boolean(tokenPair))
  // console.log('🚀 ~ file: index.tsx ~ line 152 ~ Pool ~ allPairsWithLiquidity', allPairsWithLiquidity)

  return (
    <>
      <PageWrapper>
        <JediSwapTabs active={'pool'} />

        <LiquidityWrapperCard>
          {/* <CardBGImage />
        <CardNoise /> */}
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.largeHeader>Liquidity provider rewards</TYPE.largeHeader>
              </RowBetween>
              <RowBetween>
                <DMSansText.body fontSize={16} lineHeight={'125%'} color={'#F2F2F2'}>
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
                <CreatePoolButton id="create-pool-button" as={Link} to="/create/ETH">
                  Create pair
                </CreatePoolButton>
                <CreatePoolButton id="join-pool-button" as={Link} to="/add/ETH">
                  <Text fontWeight={800} fontSize={16} lineHeight={'125%'} letterSpacing={'0.5px'}>
                    Add Liquidity
                  </Text>
                </CreatePoolButton>
              </ButtonRow>
            </TitleRow>

            {!account ? (
              <Card padding="40px">
                <TYPE.mediumHeader color={theme.jediBlue} textAlign="center">
                  Connect to a wallet to view your liquidity
                </TYPE.mediumHeader>
              </Card>
            ) : pairIsLoading ? (
              <EmptyProposals>
                <TYPE.mediumHeader color={theme.jediBlue} textAlign="center">
                  <Dots>Loading</Dots>
                </TYPE.mediumHeader>
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
  //       <CreatePoolButtonAlt as={Link} to="/add/ETH">
  //         Add Liquidity
  //       </CreatePoolButtonAlt>
  //     </ButtonRow>
  //   </Wrapper>
  // )
}

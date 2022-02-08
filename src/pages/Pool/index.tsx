import React, { useContext, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair } from '@jediswap/sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { StyledInternalLink, ExternalLink, TYPE, HideSmall } from '../../theme'
import { Text } from 'rebass'
import Card from '../../components/Card'
import Row, { RowBetween, RowFixed } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'

import { useActiveStarknetReact } from '../../hooks'
import { usePairs } from '../../data/Reserves'
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
    color: ${({ theme }) => theme.jediBlue};
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
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  console.log(
    '🚀 ~ file: index.tsx ~ line 88 ~ Pool ~ v2PairsBalances, fetchingV2PairBalances',
    v2PairsBalances,
    fetchingV2PairBalances
  )
  // fetch the reserves for all V2 pools in which the user has a balance
  //   const liquidityTokensWithBalances = useMemo(
  //     () =>
  //       tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
  //         v2PairsBalances[liquidityToken.address]?.greaterThan('0')
  //       ),
  //     [tokenPairsWithLiquidityTokens, v2PairsBalances]
  //   )

  //   const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  //   const v2IsLoading =
  //     fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  //   const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  // return (
  //   <>
  //     <PageWrapper>
  //       <SwapPoolTabs active={'pool'} />

  //       <AutoColumn gap="lg" justify="center">
  //         <AutoColumn gap="lg" style={{ width: '100%' }}>
  //           <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
  //             <HideSmall>
  //               <TYPE.mediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }} fontFamily="DM Sans">
  //                 {/* Top Pool */}
  //               </TYPE.mediumHeader>
  //             </HideSmall>
  //             <ButtonRow>
  //               <CreatePoolButton as={Link} to="/add/TOKEN0">
  //                 Add Liquidity
  //               </CreatePoolButton>
  //             </ButtonRow>
  //           </TitleRow>

  //           {/* <ComingSoonSection>Coming Soon</ComingSoonSection> */}

  //           {/* {!account ? (
  //             <Card padding="40px">
  //               <TYPE.body color={theme.text3} textAlign="center">
  //                 Connect to a wallet to view your liquidity.
  //               </TYPE.body>
  //             </Card>
  //           ) : v2IsLoading ? (
  //             <EmptyProposals>
  //               <TYPE.body color={theme.text3} textAlign="center">
  //                 <Dots>Loading</Dots>
  //               </TYPE.body>
  //             </EmptyProposals>
  //           ) : allV2PairsWithLiquidity?.length > 0 ? (
  //             <>
  //               <ButtonSecondary>
  //                 <RowBetween>
  //                   <ExternalLink href={'https://uniswap.info/account/' + account}>
  //                     Account analytics and accrued fees
  //                   </ExternalLink>
  //                   <span> ↗</span>
  //                 </RowBetween>
  //               </ButtonSecondary>

  //               {allV2PairsWithLiquidity.map(v2Pair => (
  //                 <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
  //               ))}
  //             </>
  //           ) : (
  //             <EmptyProposals>
  //               <TYPE.body color={theme.text3} textAlign="center">
  //                 No liquidity found.
  //               </TYPE.body>
  //             </EmptyProposals>
  //           )} */}
  //         </AutoColumn>
  //       </AutoColumn>
  //     </PageWrapper>
  //   </>
  // )

  return (
    <Wrapper>
      <ButtonRow>
        <CreatePoolButtonAlt as={Link} to="/add/TOKEN0">
          Add Liquidity
        </CreatePoolButtonAlt>
      </ButtonRow>
    </Wrapper>
  )
}

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { BodyWrapper } from '../AppBody'
import { Backdrop, HeaderRow } from '../Swap/styleds'
import { useWalletModalToggle } from '../../state/application/hooks'
import { darkTheme, WidoWidget, isStarknetChain, Transaction } from 'wido-widget'
import styled, { ThemeContext, css, keyframes } from 'styled-components'
import { AutoColumn } from '../../components/Column'
import StarkIcon from '../../assets/jedi/stark-logo.svg'
import './style.css'
import { useAccountDetails } from '../../hooks'
import { CurrencyAmount, Token } from '@jediswap/sdk'
import { ButtonGradient, ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { CardSection, DataCard } from '../Pool/styleds'
import { RowBetween, RowFixed } from '../../components/Row'
import { DMSansText, TYPE } from '../../theme'
import { Button as RebassButton, ButtonProps } from 'rebass/styled-components'
import { useContractRead, useContractWrite } from '@starknet-react/core'
import { Call, CallData, validateAndParseAddress } from 'starknet'
import { STARKNET_REWARDS_API_URL, STRK_PRICE_API_URL, getStarkRewardAddress } from '../../constants'
import REWARDS_ABI from '../../constants/abis/strk-rewards.json'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { jediSwapClient } from '../../apollo/client'
import { PAIRS_DATA_FOR_REWARDS } from '../../apollo/queries'
import { isEmpty } from 'lodash'
import { formattedPercent } from '../../utils'
import pairs from './RewardPairs'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useAllTokens } from '../../hooks/Tokens'

export const StyledAppBody = styled(BodyWrapper)`
  padding: 0rem;
`

const PageWrapper = styled(AutoColumn)`
  max-width: 996px;
  width: 100%;
`

const LiquidityWrapperCard = styled(DataCard)`
  overflow: hidden;
  border: none;
  border-radius: 8px;
  padding: 18px 0 18px 18px;
  border: 1px solid rgba(160, 160, 160, 0.4);
  background: rgba(255, 255, 255, 0.05);
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const ResponsiveRow = styled(RowFixed)`
  justify-content: space-between;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column-reverse;
  `};
`

export const BaseButton = styled(RebassButton)<
  {
    padding?: string
    width?: string
    $borderRadius?: string
    altDisabledStyle?: boolean
  } & ButtonProps
>`
  padding: ${({ padding }) => padding ?? '16px'};
  width: ${({ width }) => width ?? '100%'};
  font-weight: 500;
  text-align: center;
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '20px'};
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    cursor: auto;
    pointer-events: none;
  }

  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);

  > * {
    user-select: none;
  }

  > a {
    text-decoration: none;
  }
`

const ClaimHeader = styled.div`
  width: 386px;
  height: 52px;
  flex-shrink: 0;
  margin-top: 18px;
  padding: 0 32px;
  background: linear-gradient(93deg, #38164b 1.17%, rgba(235, 0, 255, 0) 86.07%);
  color: white; /* White text color */
  display: flex;
  align-items: center; /* Vertically centers the content */

  @media (max-width: 768px) {
    width: fit-content;
  }
`

const ClaimHeaderText = styled.div`
  opacity: 1;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 100% */
`

export const WrapperOutlined = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: transparent;
  color: ${({ theme }) => theme.text1};
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
`

const AmountText = styled.div`
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 62.5% */
`

const IncentivesText = styled.div`
  color: #f2f2f2;
  font-family: 'DM Sans';
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px; /* 162.5% */
`

const HeaderText = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 22px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 20px;
  `};
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 125% */
`

const ResponsiveColumn = styled(AutoColumn)`
  padding: 16px;
  border-radius: 20px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  border: 1px solid rgba(160, 160, 160, 0.4);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.text1};
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  grid-template-columns: 1fr;
  width: 100%;
  justify-content: space-between;
`

const DefiSpringWrapper = styled.div`
  padding: 16px;
  border-radius: 20px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  color: ${({ theme }) => theme.text1};
  grid-template-columns: 1fr;
  width: 100%;
  justify-content: space-between;
`

const DefiSpringTitle = styled.div`
  color: #fff;
  font-family: 'DM Sans';
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 100% */
  margin-bottom: 32px;
`

const DefiSpringTitleEarn = styled(DefiSpringTitle)`
  margin-bottom: 0;
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const DefiSpringSubTitle = styled.div`
  display: flex; /* Establishes a flex container */
  align-items: center; /* Centers the content vertically */

  /* Style for the image, if necessary */
  img {
    margin: 0 10px; /* Adjust spacing between text and image as needed */
    height: 40px; /* Fixed height for consistency */
    width: 40px; /* Fixed width for consistency */
  }

  color: #fff;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: 'DM Sans';
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 62.5% */
`

const ClaimWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ClaimButtonGradient = styled(ButtonGradient)`
  display: flex;
  width: 160px;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--Jedi-Gradient, linear-gradient(96deg, #29aafd 8.08%, #ff00e9 105.91%));
`

const ClaimText = styled.div`
  color: #fff;
  text-align: center;
  font-family: 'Avenir LT Std', sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 750;
`

const StarkRewardsText = styled.div`
  color: #fff;
  font-family: 'DM Sans';
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 100% */
`

const PairName = styled.div`
  color: var(--Jedi-White, #fff);
  text-align: center;
  font-family: 'DM Sans';
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%; /* 16px */
  margin-bottom: 10px;
`
const APRWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const TotalAPR = styled(APRWrapper)`
  width: 134px;
  height: 26px;
  background: #6a2d65;
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid rgba(160, 160, 160, 0.4);
  color: #f2f2f2;
  leading-trim: both;
  text-edge: cap;
  font-family: 'DM Sans';
  padding: 0 8px;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 26px; /* 216.667% */
`

const TokenAPR = styled(APRWrapper)`
  color: #f2f2f2;
  font-family: 'DM Sans';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px; /* 216.667% */
`

export const loadingAnimation = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

const shimmerMixin = css`
  animation: ${loadingAnimation} 1.5s infinite;
  animation-fill-mode: both;
  background: linear-gradient(
    to left,
    ${({ theme }) => theme.jediNavyBlue} 25%,
    ${({ theme }) => theme.bg3} 50%,
    ${({ theme }) => theme.jediNavyBlue} 75%
  );
  background-size: 400%;
  will-change: background-position;
`

export const LoadingRows = styled.div`
  display: grid;

  & > div {
    ${shimmerMixin}
    border-radius: 12px;
    height: 2.4em;
  }
`

const Container = styled.div`
  display: flex;
  justify-content: center;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px; /* Gap between columns */
  width: 100%;
`

const RowWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* Gap between columns */
  width: 100%;
`

const Column = styled.div`
  flex: 1;
  padding: 16px;
  border-radius: 20px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  border: 1px solid rgba(160, 160, 160, 0.4);
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.text1};
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  width: calc(33.33% - 20px); /* Adjust width and subtract gap */

  @media (max-width: 768px) {
    width: 100%; /* Each column occupies 100% width on mobile */
  }
`

// Main container for the row
const RowContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px; // Assuming you want some spacing
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

// Styled component for the first column (40%)
const FirstColumn = styled.div`
  width: 30%;
  padding: 0 15px; // For spacing
  @media (max-width: 768px) {
    width: 100%;
  }
`

// Styled component for the second column (60%)
const MobileWrapper = styled.div`
  @media (max-width: 768px) {
    padding: 10px;
  }
`

export default function Rewards() {
  const [pairsData, setPairsData] = useState([])
  const { address, chainId } = useAccountDetails()
  const [pairsLoading, setPairsLoading] = useState(false)
  const STRK_REWARDS_ADDRESS = getStarkRewardAddress(chainId)
  const allTokens = useAllTokens(chainId)

  useEffect(() => {
    const pairIds = pairs.map(pair => pair.poolAddress)

    async function getPairsData() {
      setPairsLoading(true)
      const pairsResp = await jediSwapClient.query({
        query: PAIRS_DATA_FOR_REWARDS({
          pairIds
        }),
        fetchPolicy: 'cache-first'
      })
      const rewardsResp = await fetch(STARKNET_REWARDS_API_URL).then(res => res.json())
      const priceResp = await fetch(STRK_PRICE_API_URL).then(res => res.json())

      const strkPrice = parseFloat(priceResp.price)
      const jediRewards = rewardsResp.Jediswap_v1
      const rewardsPositions: any = []
      for (const pair of pairs) {
        const rewardsData = jediRewards[pair.rewardName].pop()
        const recentDate = rewardsData.date
        const pairDayData = pairsResp.data.pairDayDatas.find(
          dayData => dayData.pairId === pair.poolAddress && dayData.date === recentDate + 'T00:00:00'
        )
        const aprFee = ((pairDayData.dailyVolumeUSD * 0.003) / pairDayData.reserveUSD) * 365 * 100
        const aprStarknet = (rewardsData.allocation / pairDayData.reserveUSD) * 365 * 100 * strkPrice
        rewardsPositions.push({
          ...pair,
          reserveUSD: pairDayData.reserveUSD,
          aprFee,
          aprStarknet
        })
      }
      const sortedRewardsPositions = rewardsPositions.sort((a, b) => {
        if (a.aprFee + a.aprStarknet > b.aprFee + b.aprStarknet) {
          return -1
        }
        if (a.aprFee + a.aprStarknet < b.aprFee + b.aprStarknet) {
          return 1
        }
      })

      setPairsData(sortedRewardsPositions)
      setPairsLoading(false)
    }

    if (!pairsData.length) {
      getPairsData()
    }
  }, [pairsData, address])

  const [allocations, setAllocations] = useState<CurrencyAmount>()
  const [allocationsLoading, setAllocationsLoading] = useState(false)
  const [claimData, setClaimData] = useState({})
  const [allocated, setAllocated] = useState(false)
  const [callData, setCallData] = useState<Call[]>([])
  const { writeAsync, data: txData } = useContractWrite({
    calls: callData
  })
  const [txHash, setTxHash] = useState('')
  const [claimError, setClaimError] = useState('')
  const [txPending, setTxPending] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false)

  const toggleWalletModal = useWalletModalToggle()

  //fetch Token Ids
  useEffect(() => {
    const getAllocation = async () => {
      if (address) {
        try {
          setAllocationsLoading(true)
          const allocation = await fetch(`https://allocations.jediswap.xyz/get_allocation_amount?address=${address}`, {
            headers: {
              accept: 'application/json'
            },
            method: 'GET'
          }).then(res => res.json())
          const totalAllocation = CurrencyAmount.ether(allocation)
          setAllocations(totalAllocation)
          const isAllocatedMoreThanZero = !totalAllocation.equalTo('0')
          setAllocated(isAllocatedMoreThanZero)
          const call_data = await fetch(`https://allocations.jediswap.xyz/get_calldata?address=${address}`, {
            headers: {
              accept: 'application/json'
            },
            method: 'GET'
          }).then(res => res.json())
          setClaimData(call_data)
          setAllocationsLoading(false)
        } catch (e) {
          setAllocationsLoading(false)
          console.error(e)
        }
      }
    }

    getAllocation()
  }, [address])

  useEffect(() => {
    if (callData.length && address) {
      writeAsync()
        .then(res => {
          if (res && res.transaction_hash) {
            setTxHash(res.transaction_hash)
          }
        })
        .catch(error => {
          const errorMessage = new Error(error)
          setClaimError(errorMessage.message)
        })
        .finally(() => {
          setAttemptingTxn(false)
          setCallData([])
        })
    }
  }, [callData, address])

  const onClaim = () => {
    setAttemptingTxn(true)
    setTxPending(true)

    const call = {
      contractAddress: STRK_REWARDS_ADDRESS,
      entrypoint: 'claim',
      calldata: CallData.compile(claimData)
    }
    setCallData([call])
  }

  const { data: claimed_rewards } = useContractRead({
    functionName: 'amount_already_claimed',
    args: [address as any],
    abi: REWARDS_ABI,
    address: STRK_REWARDS_ADDRESS,
    watch: true
  })

  const formattedClaimRewards: CurrencyAmount = useMemo(() => {
    if (claimed_rewards === null || claimed_rewards === undefined) return CurrencyAmount.ether('0')
    return CurrencyAmount.ether(claimed_rewards.toString())
  }, [claimed_rewards, address, allocations])

  const unclaimed_rewards: CurrencyAmount = useMemo(() => {
    if (formattedClaimRewards === null || formattedClaimRewards === undefined || !allocated || !allocations)
      return CurrencyAmount.ether('0')
    return allocations?.subtract(formattedClaimRewards)
  }, [formattedClaimRewards, claimed_rewards, address, allocations, allocated])

  const totalRewardsClaimed = allocations?.equalTo(formattedClaimRewards)

  const handleConfirmDismiss = () => {
    setAttemptingTxn(false)
    setTxPending(false)
    setCallData([])
  }

  const confirmationContent = useCallback(
    () => (claimError ? <TransactionErrorContent onDismiss={handleConfirmDismiss} message={claimError} /> : <></>),
    [claimError]
  )

  const buttonText =
    (totalRewardsClaimed && 'Claimed') || (unclaimed_rewards && 'Claim STRK') || (attemptingTxn && 'Claiming...')

  const PairListItem = ({ pair }: { pair: any }) => {
    const cleanedAprFee = isNaN(pair.aprFee) || !isFinite(pair.aprFee) ? 0 : pair.aprFee
    const displayAprFee = formattedPercent(cleanedAprFee, true, false)

    const cleanedAprStarknet = isNaN(pair.aprStarknet) || !isFinite(pair.aprStarknet) ? 0 : pair.aprStarknet
    const displayAprStarknet = formattedPercent(cleanedAprStarknet, true, false)

    const cleanedAprCommon = cleanedAprFee + cleanedAprStarknet
    const displayAprCommon = formattedPercent(cleanedAprCommon, true, false)

    const token0 =
      pair.token0.symbol === 'ETH' ? pair.token0 : allTokens[validateAndParseAddress(pair.token0.tokenAddress)]
    const token1 =
      pair.token1.symbol === 'ETH' ? pair.token1 : allTokens[validateAndParseAddress(pair.token1.tokenAddress)]

    return (
      <Column style={{ padding: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <DoubleCurrencyLogo size={24} currency0={token0} currency1={token1} />
        </div>
        <PairName>
          {pair?.token0?.symbol}-{pair?.token1?.symbol}
        </PairName>
        <TotalAPR>
          <div>Total APR:</div>
          <div>{displayAprCommon}</div>
        </TotalAPR>
        <TokenAPR>
          <div>Fee APR:</div>
          <div>{displayAprFee}</div>
        </TokenAPR>
        <TokenAPR>
          <div>STRK APR:</div>
          <div>{displayAprStarknet}</div>
        </TokenAPR>
      </Column>
    )
  }

  return (
    <PageWrapper>
      {allocationsLoading || pairsLoading ? (
        <LoadingRows>
          <div style={{ height: 450 }} />
        </LoadingRows>
      ) : (
        <>
          <TransactionConfirmationModal
            isOpen={txPending}
            onDismiss={handleConfirmDismiss}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={confirmationContent}
            pendingText={''}
          />
          <LiquidityWrapperCard style={{ marginBottom: 14 }}>
            <RowContainer>
              <FirstColumn>
                <DefiSpringWrapper>
                  <DefiSpringTitle>StarkNet DeFi Spring</DefiSpringTitle>
                  <DefiSpringSubTitle>
                    40M <img src={StarkIcon} alt="starknet_logo" /> STRK
                  </DefiSpringSubTitle>
                  <IncentivesText>
                    JediSwap users will receive STRK incentives as part of the StarkNet DeFi Spring Program.
                  </IncentivesText>
                </DefiSpringWrapper>
              </FirstColumn>
              <MobileWrapper>
                <DefiSpringWrapper>
                  <DefiSpringTitleEarn>Earn STRK incentives by providing liquidity to these pools:</DefiSpringTitleEarn>
                </DefiSpringWrapper>
                <Container>
                  <RowWrapper>
                    {pairsData.map(pair => (
                      <PairListItem key={pair} pair={pair} />
                    ))}
                  </RowWrapper>
                </Container>
              </MobileWrapper>
            </RowContainer>
          </LiquidityWrapperCard>
          <LiquidityWrapperCard>
            <RowBetween>
              <ClaimHeader>
                <ClaimHeaderText>Next claim available on March 09</ClaimHeaderText>
              </ClaimHeader>
            </RowBetween>
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <StarkRewardsText>Your STRK Rewards</StarkRewardsText>
                </RowBetween>

                <Container>
                  <Row>
                    <Column>
                      <HeaderText>
                        <>
                          <img src={StarkIcon} style={{ marginRight: 5 }} />
                          STRK ALLOCATED
                        </>
                      </HeaderText>
                      <AmountText>{allocations?.toSignificant() ?? 0}</AmountText>
                    </Column>
                    <Column>
                      <HeaderText>
                        <>
                          <img src={StarkIcon} style={{ marginRight: 5 }} />
                          STRK CLAIMED
                        </>
                      </HeaderText>
                      <AmountText>{formattedClaimRewards?.toSignificant() ?? 0}</AmountText>
                    </Column>
                    <Column>
                      <HeaderText>
                        <>
                          <img src={StarkIcon} style={{ marginRight: 5 }} />
                          STRK UNCLAIMED
                        </>
                      </HeaderText>
                      <ClaimWrapper>
                        <AmountText>{unclaimed_rewards.toSignificant() ?? 0}</AmountText>

                        {!address ? (
                          <ClaimButtonGradient
                            onClick={toggleWalletModal}
                            disabled={attemptingTxn || totalRewardsClaimed}
                          >
                            <ClaimText>Connect Wallet</ClaimText>
                          </ClaimButtonGradient>
                        ) : allocated && allocations && (totalRewardsClaimed || unclaimed_rewards || attemptingTxn) ? (
                          <ClaimButtonGradient onClick={onClaim} disabled={attemptingTxn || totalRewardsClaimed}>
                            <ClaimText>{buttonText}</ClaimText>
                          </ClaimButtonGradient>
                        ) : null}
                      </ClaimWrapper>
                    </Column>
                  </Row>
                </Container>
              </AutoColumn>
            </CardSection>
          </LiquidityWrapperCard>
        </>
      )}
    </PageWrapper>
  )
}

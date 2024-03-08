import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { BodyWrapper } from '../AppBody'
import { Backdrop, HeaderRow } from '../Swap/styleds'
import { useWalletModalToggle } from '../../state/application/hooks'
import { darkTheme, WidoWidget, isStarknetChain, Transaction } from 'wido-widget'
import styled, { ThemeContext } from 'styled-components'
import { InjectedConnector } from '@web3-react/injected-connector'
import { AutoColumn } from '../../components/Column'
import StarkIcon from '../../assets/jedi/stark-logo.svg'
import './style.css'
import { useAccountDetails } from '../../hooks'
import { CurrencyAmount } from '@jediswap/sdk'
import { ButtonGradient, ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { CardSection, DataCard } from '../Pool/styleds'
import { RowBetween, RowFixed } from '../../components/Row'
import { DMSansText, TYPE } from '../../theme'
import { Button as RebassButton, ButtonProps } from 'rebass/styled-components'
import { useContractRead, useContractWrite } from '@starknet-react/core'
import { Call, CallData } from 'starknet'
import { STARKNET_REWARDS_API_URL, STRK_PRICE_API_URL, STRK_REWARDS_ADDRESS } from '../../constants'
import REWARDS_ABI from '../../constants/abis/strk-rewards.json'
import TransactionConfirmationModal, { TransactionErrorContent } from '../../components/TransactionConfirmationModal'
import { jediSwapClient } from '../../apollo/client'
import { PAIRS_DATA_FOR_REWARDS } from '../../apollo/queries'
import { isEmpty } from 'lodash'
import { formattedPercent } from '../../utils'

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

const pairs = [
  {
    rewardName: 'USDC/USDT',
    poolAddress: '0x5801bdad32f343035fb242e98d1e9371ae85bc1543962fedea16c59b35bd19b',
    token0: {
      tokenAddress: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
      symbol: 'USDC'
    },
    token1: {
      tokenAddress: '0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
      symbol: 'USDT'
    }
  },
  {
    rewardName: 'STRK/ETH',
    poolAddress: '0x2ed66297d146ecd91595c3174da61c1397e8b7fcecf25d423b1ba6717b0ece9',
    token0: {
      tokenAddress: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      symbol: 'STRK'
    },
    token1: {
      tokenAddress: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
      symbol: 'ETH'
    }
  },
  {
    rewardName: 'ETH/USDC',
    poolAddress: '0x4d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a',
    token0: {
      tokenAddress: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
      symbol: 'ETH'
    },
    token1: {
      tokenAddress: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
      symbol: 'USDC'
    }
  },
  {
    rewardName: 'STRK/USDC',
    poolAddress: '0x5726725e9507c3586cc0516449e2c74d9b201ab2747752bb0251aaa263c9a26',
    token0: {
      tokenAddress: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      symbol: 'STRK'
    },
    token1: {
      tokenAddress: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
      symbol: 'USDC'
    }
  }
]

export default function Rewards() {
  const [pairsData, setPairsData] = useState([])
  const [pairsLoading, setPairsLoading] = useState(false)
  useEffect(() => {
    setPairsLoading(true)
    const pairIds = pairs.map(pair => pair.poolAddress)

    async function getPairsData() {
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
  }, [pairsData])

  const { address } = useAccountDetails()
  const [allocations, setAllocations] = useState<CurrencyAmount>()
  const [allocated, setAllocated] = useState(false)
  const [claimData, setClaimData] = useState<Call>({
    contractAddress: STRK_REWARDS_ADDRESS,
    entrypoint: 'claim',
    calldata: []
  })
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
          const updateCallData = { ...claimData, calldata: CallData.compile(call_data) }
          setClaimData(updateCallData)
        } catch (e) {
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
    setCallData([claimData])
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

  const unclaimed_rewards = useMemo(() => {
    if (formattedClaimRewards === null || formattedClaimRewards === undefined || !allocated || !allocations) return 0
    return allocations?.subtract(formattedClaimRewards).toExact()
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
    return (
      <RowFixed style={{ marginRight: 5 }}>
        <ResponsiveColumn>
          {/* <DoubleCurrencyLogo
            size={20}
            a0={pair.token0.tokenAddress}
            a1={pair.token1.tokenAddress}
            s0={pair.token0.symbol}
            s1={pair.token1.symbol}
            margin
          /> */}
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
        </ResponsiveColumn>
      </RowFixed>
    )
  }

  console.log(pairsData, 'pairsData')

  return (
    <PageWrapper>
      <TransactionConfirmationModal
        isOpen={txPending}
        onDismiss={handleConfirmDismiss}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={''}
      />
      <LiquidityWrapperCard style={{ marginBottom: 14 }}>
        <CardSection>
          <AutoColumn gap="md">
            <ResponsiveRow>
              <RowFixed style={{ width: '35%' }}>
                <DefiSpringWrapper>
                  <DefiSpringTitle>StarkNet DeFi Spring</DefiSpringTitle>
                  <DefiSpringSubTitle>
                    40M <img src={StarkIcon} alt="starknet_logo" /> STRK
                  </DefiSpringSubTitle>
                  <IncentivesText>
                    JediSwap users will receive STRK incentives as part of the StarkNet DeFi Spring Program.
                  </IncentivesText>
                </DefiSpringWrapper>
              </RowFixed>
              <div>
                <DefiSpringTitle>Earn STRK incentives by providing liquidity to these pools:</DefiSpringTitle>
                <RowFixed>
                  <ResponsiveRow>
                    {pairsData.length ? pairsData.map(pair => <PairListItem key={pair} pair={pair} />) : 'Loading'}
                  </ResponsiveRow>
                </RowFixed>
              </div>
            </ResponsiveRow>
          </AutoColumn>
        </CardSection>
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
            <ResponsiveRow>
              <RowFixed style={{ width: '25%' }}>
                <ResponsiveColumn>
                  <HeaderText>
                    <>
                      <img src={StarkIcon} style={{ marginRight: 5 }} />
                      STRK ALLOCATED
                    </>
                  </HeaderText>
                  <AmountText>{allocations?.toExact() ?? 0}</AmountText>
                </ResponsiveColumn>
              </RowFixed>
              <RowFixed style={{ width: '25%' }}>
                <ResponsiveColumn>
                  <HeaderText>
                    <>
                      <img src={StarkIcon} style={{ marginRight: 5 }} />
                      STRK CLAIMED
                    </>
                  </HeaderText>
                  <AmountText>{formattedClaimRewards.toExact() ?? 0}</AmountText>
                </ResponsiveColumn>
              </RowFixed>
              <RowFixed style={{ width: '40%' }}>
                <ResponsiveColumn>
                  <HeaderText>
                    <>
                      <img src={StarkIcon} style={{ marginRight: 5 }} />
                      STRK UNCLAIMED
                    </>
                  </HeaderText>
                  <ClaimWrapper>
                    <AmountText>{unclaimed_rewards ?? 0}</AmountText>

                    {!address ? (
                      <ClaimButtonGradient onClick={toggleWalletModal} disabled={attemptingTxn || totalRewardsClaimed}>
                        <ClaimText>Connect Wallet</ClaimText>
                      </ClaimButtonGradient>
                    ) : allocated && allocations && (totalRewardsClaimed || unclaimed_rewards || attemptingTxn) ? (
                      <ClaimButtonGradient onClick={onClaim} disabled={attemptingTxn || totalRewardsClaimed}>
                        <ClaimText>{buttonText}</ClaimText>
                      </ClaimButtonGradient>
                    ) : null}
                  </ClaimWrapper>
                </ResponsiveColumn>
              </RowFixed>
            </ResponsiveRow>
          </AutoColumn>
        </CardSection>
      </LiquidityWrapperCard>
    </PageWrapper>
  )
}

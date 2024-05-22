import React, { useEffect, useState } from 'react'
// import { Text } from 'rebass'
import { NavLink, withRouter } from 'react-router-dom'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'

import styled from 'styled-components'

import Logo from '../../assets/jedi/logo.png'
// import LogoDark from '../../assets/svg/logo_white.svg'
// import { useDarkModeManager } from '../../state/user/hooks'
// import { useETHBalances } from '../../state/wallet/hooks'
import { ExternalLink, TYPE } from '../../theme'
// import { ExternalLink } from '../../theme'

import { YellowCard } from '../Card'
// import Settings from '../Settings'
// import Menu from '../Menu'

import Row from '../Row'
// import { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import { transparentize } from 'polished'
import { useAccountDetails } from '../../hooks'
import { ChainId } from '@jediswap/sdk'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 76px;
  top: 0;
  position: relative;
  border-bottom: 1.25px solid ${({ theme }) => transparentize(0.75, theme.jediGrey)};
  z-index: 2;
  padding: 1rem 64px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  // justify-content: flex-start;
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
  gap: 30px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

// const HeaderElementWrap = styled.div`
//   display: flex;
//   align-items: center;
// `

// const HeaderRow = styled(RowFixed)`
//   ${({ theme }) => theme.mediaWidth.upToMedium`
//    width: 100%;
//   `};
//   // width: 400px;
//   justify-content: center;
// `

const HeaderLinks = styled(Row)`
  justify-content: space-around;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    // padding: 1rem 0 1rem 1rem;
    justify-content: flex-start;
`};
  /* gap: 38px;
   */
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex: 0;
  flex-direction: row;
  align-items: center;
  // background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg3)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
  /* :hover {
    background-color: ${({ theme, active }) => (!active ? theme.bg2 : theme.bg4)};
  } */
`

const UNIAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const HideSmall = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const NetworkCard = styled(YellowCard)`
  border-radius: 8px;
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  background-color: ${({ theme }) => theme.jediNavyBlue};
  color: ${({ theme }) => theme.jediWhite};
  padding: 0.82rem 2rem;
  border: 2px solid transparent;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  `};
`

const NetworkSelect = styled.select`
  border-radius: 8px;
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  background-color: ${({ theme }) => theme.jediNavyBlue};
  color: ${({ theme }) => theme.jediWhite};
  padding: 0.82rem 2rem;
  border: 2px solid transparent;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  `};
`

// const BalanceText = styled(Text)`
//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//     display: none;
//   `};
// `

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const JediIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  // border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.white};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  padding: 12px 0;

  font-weight: 800;
  line-height: 100%;
  text-align: center;
  text-transform: uppercase;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `};

  &.${activeClassName} {
    
    color:rgba(255, 255, 255, 0.8);
    /* border-bottom: 2px solid rgba(49, 255, 156, 0.5); */
    /* display: block; */
    position: relative;


    &::after {
    content: '';
    position: absolute;
    z-index: -1;
    bottom: -1px;
    width: 100%;
    height: 2px;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.8), 
              rgba(255, 255, 255, 0.8)), 
              linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);


    box-shadow: 0px 0px 18.9113px rgba(49, 255, 156, 0.7), 
                0px 0px 73.2115px rgba(49, 255, 156, 0.5), 
                inset 0px 0px 7.32115px rgba(49, 255, 156, 0.5);
    }

    text-shadow: 0px 0px 18.9113px rgba(49, 255, 156, 0.7), 
                 0px 0px 73.2115px rgba(49, 255, 156, 0.5);
  }

  :hover,
  :focus {
    // color: ${({ theme }) => darken(0.1, theme.text1)};
    color:rgba(255, 255, 255, 0.8);
  }
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  // border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.white};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  padding: 12px 0;

  font-weight: 800;
  line-height: 100%;
  text-align: center;
  text-transform: uppercase;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
    margin: 0 7px;
  `};
  :hover,
  :focus {
      // color: ${({ theme }) => darken(0.1, theme.text1)};
    color:rgba(255, 255, 255, 0.8);
    text-decoration: none;
  }
`
const StarkNetCard = styled.div`
  height: 38px;
  width: 124px;
  background: ${({ theme }) => theme.jediNavyBlue};
  color: ${({ theme }) => theme.white};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  // text-align: center;
`

interface window {
  starknet: any
}

function Header({ history }: { history: any }) {
  const { address, status, chainId } = useAccountDetails()
  const { t } = useTranslation()
  const isNetworkMainnet = chainId === ChainId.SN_MAIN

  // async function changeNetwork(e) {
  //   e.preventDefault()
  //   console.log(e.target.value)
  //   const change = await window.starknet?.request({
  //     type: 'wallet_switchStarknetChain',
  //     params: {
  //       chainId: e.target.value
  //     }
  //   })
  //   console.log('Network Change Call')
  //   console.log(change)
  // }

  return (
    <HeaderFrame>
      <Title href="." style={{}}>
        <JediIcon>
          <img width={'195px'} height={'32px'} src={Logo} alt="logo" />
        </JediIcon>
      </Title>
      {/* <HeaderRow> */}
      <HeaderLinks>
        <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => history.location.pathname.includes('/swap')}>
          {t('Trade')}
        </StyledNavLink>
        <StyledNavLink
          id={`pool-nav-link`}
          to={'/pool'}
          isActive={() =>
            history.location.pathname.includes('/pool') ||
            history.location.pathname.includes('/add') ||
            history.location.pathname.includes('/remove')
          }
        >
          {t('Pool')}
        </StyledNavLink>
        {/* <StyledNavLink id={`swap-nav-link`} to={'/zap'} isActive={() => history.location.pathname.includes('/zap')}>
          {t('Zap')}
        </StyledNavLink> */}
        {/* <StyledNavLink
          id={`swap-nav-link`}
          to={'/bridge'}
          isActive={() => history.location.pathname.includes('/bridge')}
        >
          {t('Bridge')}
        </StyledNavLink> */}

        <StyledExternalLink id={`stake-nav-link`} href={'https://info.jediswap.xyz'}>
          Dashboard
        </StyledExternalLink>

        <StyledExternalLink id={`jedi-v2-link`} href={'https://app.jediswap.xyz/'}>
          V2
        </StyledExternalLink>

        <StyledNavLink id={`rewards-link`} to={'/rewards'}>
          Rewards
        </StyledNavLink>

        {/* <StyledNavLink id={`stake-nav-link`} to={'/uni'} isActive={() => history.location.pathname.includes('/uni')}>
            UNI
          </StyledNavLink> */}
        {/* <StyledNavLink
            id={`stake-nav-link`}
            to={'/vote'}
            isActive={() => history.location.pathname.includes('/vote')}
          >
            Vote
          </StyledNavLink> */}
        {/* <StyledExternalLink id={`stake-nav-link`} href={'https://uniswap.info'}>
            Charts <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink> */}
      </HeaderLinks>
      {/* </HeaderRow> */}
      <HeaderControls>
        {/* <StarkNetCard>Starknet</StarkNetCard> */}
        <HeaderElement>
          <HideSmall>
            {status === 'connected' ? (
              isNetworkMainnet ? (
                <NetworkCard title={'Starknet Mainnet'}>{'Starknet Mainnet'}</NetworkCard>
              ) : (
                <NetworkCard title={'Starknet Görli'}>{'Starknet Görli'}</NetworkCard>
              )
            ) : null}
            {/*<NetworkSelect onChange={changeNetwork}>*/}
            {/*  <option value="SN_MAIN">Starknet-Mainnet</option>*/}
            {/*  <option value="SN_GOERLI">Starknet-Görli</option>*/}
            {/*</NetworkSelect>*/}
          </HideSmall>
          <AccountElement active={!!address} style={{ pointerEvents: 'auto' }}>
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        {/* <HeaderElementWrap>
          <Settings />
          <Menu />
        </HeaderElementWrap> */}
      </HeaderControls>
    </HeaderFrame>
  )
}

export default withRouter(Header)

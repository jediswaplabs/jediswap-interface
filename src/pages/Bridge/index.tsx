import React, { useCallback, useEffect, useState } from 'react'
import { AbstractConnector } from '@web3-starknet-react/abstract-connector'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { UnsupportedChainIdError, useStarknetReact } from '@web3-starknet-react/core'
import ReactGA from 'react-ga4'
import AppBody from '../AppBody'
import { Wrapper, HeaderRow, HeaderNote, HeaderInfo } from './styleds'
import styled from 'styled-components'
import Settings from '../../components/Settings'
import { DMSansText } from '../../theme'
import Column, { AutoColumn } from '../../components/Column'
import AddressInputPanel from '../../components/AddressInputPanel'
import { AutoRow, RowBetween, RowCentered } from '../../components/Row'
import { ArrowWrapper, BottomGrouping } from '../../components/swap/styleds'
import { AddTokenRow, AddTokenText, Icon, IconWrapper } from '../Swap/styleds'
import SwapWidget from '../../assets/jedi/SwapWidget.svg'
import { useActiveStarknetReact } from '../../hooks'
import {
  ButtonConfirmed,
  ButtonError,
  ButtonPrimary,
  RedGradientButton,
  ButtonSecondary
} from '../../components/Button'
import { BorderWrapper } from '../../components/AccountDetails'
import Loader from '../../components/Loader'
import { Wallet } from 'ethers'
import Option from './Option'
import Matamask from './Matamask'
import { SUPPORTED_WALLETS } from '../../constants'
import { isMobile } from 'react-device-detect'
import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/actions'
import usePrevious from '../../hooks/usePrevious'
import { ExternalLink } from '../../theme'
import PendingView from '../../components/WalletModal/PendingView'
import MetamaskIcon from '../../assets/images/metamask.png'
import argentXIcon from '../../assets/images/argentx.png'
import { argentX } from '../../connectors'
import { shortenAddress } from '../../utils'

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

export const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending'
}

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
  ENSName
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  // important that these are destructed from the account-specific web3-react context
  const { active, connectedAddress, account, connector, activate, error } = useStarknetReact()

  // const connectStarknet = useStarknetConnector({ showModal: true })

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

  const [pendingError, setPendingError] = useState<any>()

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = ''
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name)
      }
      return true
    })
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name
    })
    setPendingWallet(connector) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

    connector &&
      activate(connector, undefined, true).catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector) // a little janky...can't use setError because the connector isn't set
        } else {
          console.error(error)
          setPendingError(error)
        }
      })
  }

  function getStatusIcon() {
    if (connector === argentX) {
      return (
        <IconWrapper>
          <img src={argentXIcon} alt="argentX" />
        </IconWrapper>
      )
    }
    return null
  }

  function getOptions() {
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key]
      if (isMobile) {
        if (!window.starknet && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector)
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={option.icon}
            />
          )
        }
        return null
      }

      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector)
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={option.icon}
          />
        )
      )
    })
  }
  // .....................getMatamasks.......................
  function getMatamasks() {
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key]
      if (isMobile) {
        if (!window.starknet && option.mobile) {
          return (
            <Matamask
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector)
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={option.icon}
            />
          )
        }
        return null
      }

      return (
        !isMobile &&
        !option.mobileOnly && (
          <Matamask
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector)
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={option.icon}
          />
        )
      )
    })
  }

  {
    if (error) {
      return (
        <UpperSection>
          <HeaderRow>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error connecting'}</HeaderRow>
        </UpperSection>
      )
    }
    return (
      <>
        <AppBody>
          <Wrapper>
            <AutoColumn gap="14px" style={{ marginBottom: '18px' }}>
              <HeaderInfo fontSize={16}>Please connect your Ethereum wellet and Argent wellet</HeaderInfo>
            </AutoColumn>
            <>
              <>
                <BorderWrapper>{getOptions()}</BorderWrapper>
              </>
            </>
            <AutoColumn gap="14px" style={{ marginTop: '20px' }}></AutoColumn>
            <>
              <>
                <BorderWrapper>{getMatamasks()}</BorderWrapper>
              </>
            </>
          </Wrapper>
        </AppBody>
      </>
    )
  }
}
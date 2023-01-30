import React, { useCallback, useEffect, useState } from 'react'
import { AbstractConnector } from '@web3-starknet-react/abstract-connector'
import { UnsupportedChainIdError, useStarknetReact } from '@web3-starknet-react/core'
import ReactGA from 'react-ga4'
import AppBody from '../AppBody'
import { Wrapper, HeaderRow, HeaderInfo } from './styleds'
import styled from 'styled-components'
import Column, { AutoColumn } from '../../components/Column'
import { IconWrapper } from '../Swap/styleds'
import { BorderWrapper } from '../../components/AccountDetails'
import Argent from './Argent'
import { SUPPORTED_WALLETS } from '../../constants'
import { isMobile } from 'react-device-detect'
import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/actions'
import usePrevious from '../../hooks/usePrevious'
import argentXIcon from '../../assets/images/argentx.png'
import { argentX } from '../../connectors'
import MetaMask from './MetaMask'

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
export const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending'
}

export default function WalletModal({}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
  ENSName?: string
}) {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error } = useStarknetReact()

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

  function getArgent() {
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const argent = SUPPORTED_WALLETS[key]
      if (isMobile) {
        if (!window.starknet && argentargent.mobile) {
          return (
            <Argent
              onClick={() => {
                argentargent.connector !== connector && !argentargent.href && tryActivation(argentargent.connector)
              }}
              id={`connect-${key}`}
              key={key}
              active={argentargent.connector && argentargent.connector === connector}
              color={argentargent.color}
              link={argentargent.href}
              header={argentargent.name}
              subheader={null}
              icon={argentargent.icon}
            />
          )
        }
        return null
      }

      return (
        !isMobile &&
        !argent.mobileOnly && (
          <Argent
            id={`connect-${key}`}
            onClick={() => {
              argent.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !argent.href && tryActivation(argent.connector)
            }}
            key={key}
            active={argent.connector === connector}
            color={argent.color}
            link={argent.href}
            header={argent.name}
            subheader={null} //use argent.descriptio to bring back multi-line
            icon={argent.icon}
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
              <HeaderInfo fontSize={16}>Please connect your Ethereum wallet and Argent wallet</HeaderInfo>
            </AutoColumn>
            <AutoColumn gap="14px" style={{ marginTop: '20px' }}></AutoColumn>
            <>
              <>
                <BorderWrapper>{getArgent()}</BorderWrapper>
              </>
            </>
            <AutoColumn gap="14px" style={{ marginTop: '20px' }}></AutoColumn>
            <>
              <>
                <BorderWrapper>
                  <MetaMask />
                </BorderWrapper>
              </>
            </>
          </Wrapper>
        </AppBody>
      </>
    )
  }
}

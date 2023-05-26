import { AbstractConnector } from '@web3-starknet-react/abstract-connector'
import { UnsupportedChainIdError, useStarknetReact } from '@web3-starknet-react/core'
import { darken, lighten } from 'polished'
import React, { useMemo, useEffect, useState } from 'react'
// import { Activity } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg'
import FortmaticIcon from '../../assets/images/fortmaticIcon.png'
import PortisIcon from '../../assets/images/portisIcon.png'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import ArgentXIcon from '../../assets/images/argentx.png'
import braavosIcon from '../../assets/svg/Braavos.svg'
import { argentX, braavosWallet } from '../../connectors'
import { NetworkContextName } from '../../constants'
import { useWalletModalToggle } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { shortenAddress } from '../../utils'
import { ButtonSecondary } from '../Button'

import Identicon from '../Identicon'
import Loader from '../Loader'

import { RowBetween } from '../Row'
import WalletModal from '../WalletModal'
import WrongNetwork from '../../assets/jedi/WrongNetwork.svg'
import { useActiveStarknetReact } from '../../hooks'
import { hexToDecimalString } from 'starknet/dist/utils/number'
import { useAccount } from '@starknet-react/core'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  padding-bottom: 4px;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  /* padding: 0.5rem; */
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.signalRed};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
     /* background-color: ${({ theme }) => darken(0.1, theme.red1)}; */
  }
`

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background: linear-gradient(95.64deg, #29aafd 8.08%, #ff00e9 105.91%);
  border: none;
  color: ${({ theme }) => theme.jediWhite};
  height: 38px;
  width: 202px;
  border-radius: 8px;
  transition: all 5s ease-out;

  :hover,
  :focus {
    background: linear-gradient(95.64deg, #ff00e9 8.08%, #29aafd 105.91%);
    border: none;
    color: ${({ theme }) => theme.jediWhite};
  }

  ${({ faded }) =>
    faded &&
    css`
       /* background-color: ${({ theme }) => theme.primary5}; */
       /* border: 1px solid ${({ theme }) => theme.primary5}; */
      color: ${({ theme }) => theme.jediWhite};

      :hover,
      :focus {
         /* border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)}; */
        color: ${({ theme }) => darken(0.05, theme.jediWhite)};
      }
    `}
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.primary1 : ' rgba(255, 255, 255, 0.15)')};
  border: 2px solid transparent;
  padding: 0.6rem 1rem 0.6rem 0.9rem;
  color: ${({ pending, theme }) => (pending ? theme.white : theme.jediWhite)};
  /* padding: 0.4rem 1rem 0.4rem 0.9rem; */
  
  
  :hover,
  :focus {
     /* background-color: ${({ pending, theme }) =>
       pending ? darken(0.05, theme.primary1) : lighten(0.05, theme.bg2)}; */
border: 2px solid ${({ pending, theme }) => (pending ? theme.primary1 : theme.jediWhite)};
    :focus {
       /* border: 1px solid ${({ pending, theme }) =>
         pending ? darken(0.1, theme.primary1) : darken(0.1, theme.bg3)}; */
    }
  }
`

const Text = styled.p`
  margin: 0 0.5rem 0 0.5rem;
  font-family: 'Avenir LT Std';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
`
const ConnectStateText = styled(Text)`
  font-size: 16px;
  font-style: normal;
  font-weight: 800;
  line-height: 20px;
  text-align: left;
`
const NetworkIcon = styled.img`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const SOCK = (
  <span role="img" aria-label="has socks emoji" style={{ marginTop: -4, marginBottom: -4 }}>
    🧦
  </span>
)

// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: AbstractConnector }) {
  // if (connector === injected) {
  //   return <Identicon />
  // } else if (connector === walletconnect) {
  //   return (
  //     <IconWrapper size={16}>
  //       <img src={WalletConnectIcon} alt={''} />
  //     </IconWrapper>
  //   )
  // } else if (connector === walletlink) {
  //   return (
  //     <IconWrapper size={16}>
  //       <img src={CoinbaseWalletIcon} alt={''} />
  //     </IconWrapper>
  //   )
  // } else if (connector === fortmatic) {
  //   return (
  //     <IconWrapper size={16}>
  //       <img src={FortmaticIcon} alt={''} />
  //     </IconWrapper>
  //   )
  // } else if (connector === portis) {
  //   return (
  //     <IconWrapper size={16}>
  //       <img src={PortisIcon} alt={''} />
  //     </IconWrapper>
  //   )
  // }
  if (connector === argentX) {
    return (
      <IconWrapper size={20}>
        <img src={ArgentXIcon} alt="ArgentX" />
      </IconWrapper>
    )
  }

  if (connector === braavosWallet) {
    return (
      <IconWrapper size={20}>
        <img src={braavosIcon} alt="myBraavos" />
      </IconWrapper>
    )
  }
  return null
}

function Web3StatusInner({ starkID }: { starkID?: string }) {
  const { t } = useTranslation()
  const { connector, error } = useActiveStarknetReact()
  const { address } = useAccount()

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions
    .filter(tx => !tx.receipt || tx.receipt.status === 'PENDING' || tx.receipt.status === 'RECEIVED')
    .map(tx => tx.hash)

  const hasPendingTransactions = !!pending.length
  // const hasSocks = useHasSocks()
  const toggleWalletModal = useWalletModalToggle()

  if (address) {
    return (
      <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
        {!hasPendingTransactions && connector && <StatusIcon connector={connector} />}
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>{pending?.length} Pending</Text> <Loader stroke="white" />
          </RowBetween>
        ) : (
          <Text>{starkID ? starkID : shortenAddress(address)}</Text>
        )}
      </Web3StatusConnected>
    )
  } else if (error) {
    return (
      <Web3StatusError onClick={toggleWalletModal}>
        <NetworkIcon src={WrongNetwork} />
        <Text>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</Text>
      </Web3StatusError>
    )
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal}>
        <ConnectStateText>{t('Connect wallet')}</ConnectStateText>
      </Web3StatusConnect>
    )
  }
}

export default function Web3Status() {
  const { chainId } = useStarknetReact()
  const { address } = useAccount()
  const contextNetwork = useStarknetReact(NetworkContextName)

  type DomainToAddrData = { domain: string; domain_expiry: number }

  const [domain, setDomain] = useState<string>('')

  useEffect(() => {
    if (chainId == 1) {
      fetch('https://app.starknet.id/api/indexer/addr_to_domain?addr=' + hexToDecimalString(address ?? ''))
        .then(response => response.json())
        .then((data: DomainToAddrData) => {
          setDomain(data.domain)
        })
        .catch(error => {
          console.error(error)
        })
    }
    if (chainId == 5) {
      fetch('https://goerli.app.starknet.id/api/indexer/addr_to_domain?addr=' + hexToDecimalString(address ?? ''))
        .then(response => response.json())
        .then((data: DomainToAddrData) => {
          setDomain(data.domain)
        })
        .catch(error => {
          console.error(error)
        })
    }
  }, [address, chainId])

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions
    .filter(tx => !tx.receipt || tx.receipt.status === 'PENDING' || tx.receipt.status === 'RECEIVED')
    .map(tx => tx.hash)

  const confirmed = sortedRecentTransactions
    .filter(tx => tx.receipt && tx.receipt.status !== 'PENDING' && tx.receipt.status !== 'RECEIVED')
    .map(tx => tx.hash)

  // if (!contextNetwork.active && !active) {
  //   return null
  // }

  return (
    <>
      <Web3StatusInner starkID={domain} />
      <WalletModal pendingTransactions={pending} confirmedTransactions={confirmed} ENSName={domain} />
    </>
  )
}

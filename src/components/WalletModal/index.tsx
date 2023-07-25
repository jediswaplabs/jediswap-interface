import { UnsupportedChainIdError, useStarknetReact } from '@web3-starknet-react/core'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import ReactGA from 'react-ga4'
import styled from 'styled-components'
import MetamaskIcon from '../../assets/images/metamask.png'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { isProductionChainId, isProductionEnvironment, isTestnetChainId, isTestnetEnvironment } from '../../connectors'
import { SUPPORTED_WALLETS, WalletInfo } from '../../constants'
import usePrevious from '../../hooks/usePrevious'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import { ExternalLink } from '../../theme'
import AccountDetails from '../AccountDetails'
import Modal from '../Modal'
import Option from './Option'
import PendingView from './PendingView'
import { useConnectors } from '@starknet-react/core'
import { getStarknet } from 'get-starknet-core'
import { StarknetChainId } from 'starknet/dist/constants'
import { useAccountDetails } from '../../hooks'

const CloseIcon = styled.div`
  position: absolute;
  right: 2rem;
  top: 28px;
  color:${({ theme }) => theme.jediWhite}
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 2rem 2rem 0;
  font-weight: 500;
  color: ${({ theme }) => theme.jediWhite};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.jediNavyBlue};
  padding: 2rem;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

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

const Blurb = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.jediWhite};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
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
  const { active, error } = useStarknetReact()
  const { connect } = useConnectors()
  const { getAvailableWallets } = getStarknet()

  const { account, chainId, connector, status } = useAccountDetails()

  // const connectStarknet = useStarknetConnector({ showModal: true })

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<WalletInfo>()

  const [availableWallets, setAvailableWallets] = useState<any>()

  const [pendingError, setPendingError] = useState<any>()

  const [chainError, setChainError] = useState<any>()

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)

  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)

  useEffect(() => {
    if (status === 'connected' && chainId) {
      if (
        (isProductionEnvironment() && !isProductionChainId(chainId)) ||
        (isTestnetEnvironment() && !isTestnetChainId(chainId)) ||
        (chainId && !Object.values(StarknetChainId).includes(chainId))
      )
        setChainError(true)
    }
  }, [status])

  useEffect(() => {
    //check all available wallets from browser
    const getWallets = async () => {
      const available_wallets = await getAvailableWallets()
      setAvailableWallets(available_wallets)
    }

    getWallets()
  }, [])

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

  const tryActivation = async (option: WalletInfo) => {
    console.log('🚀 ~ file: index.tsx:203 ~ tryActivation ~ option:', option)
    if (!option) return
    const { connector, id } = option
    //check if selected wallet is installed
    const checkIfWalletExists = availableWallets.find(wallet => wallet.id === connector?.id())
    if (checkIfWalletExists || id === 'argentWebWallet') {
      // log selected wallet
      ReactGA.event({
        category: 'Wallet',
        action: 'Change Wallet',
        label: (connector && SUPPORTED_WALLETS[connector.id()].name) || ''
      })
      setPendingWallet(option) // set wallet for pending view
      setWalletView(WALLET_VIEWS.PENDING)
      try {
        if (connector) {
          connect(connector)
          toggleWalletModal()
          if (connector.id() === 'argentX') {
            localStorage.setItem('auto-injected-wallet', 'argentX')
          } else if (connector.id() === 'braavos') {
            localStorage.setItem('auto-injected-wallet', 'braavos')
          } else {
            localStorage.removeItem('auto-injected-wallet')
          }
          setWalletView(WALLET_VIEWS.ACCOUNT)
        }
      } catch (error) {
        // Store the error in a variable
        const errorValue = error
        setPendingError(errorValue)
      }
    } else {
      setWalletView(WALLET_VIEWS.PENDING)
      setPendingError(connector?.id())
    }
  }

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key]
      return (
        <Option
          id={`connect-${key}`}
          onClick={() => {
            option.connector === connector ? setWalletView(WALLET_VIEWS.ACCOUNT) : !option.href && tryActivation(option)
          }}
          key={key}
          subheader={key === 'argentWebWallet' && 'Powered by Argent'}
          active={option.connector === connector}
          color={option.color}
          link={option.href}
          header={option.name}
          icon={option.icon}
          size={option.size ?? null}
        />
      )
    })
  }

  function getModalContent() {
    if (error || chainError) {
      return (
        <UpperSection>
          <CloseIcon onClick={toggleWalletModal}>
            <CloseColor />
          </CloseIcon>
          <HeaderRow>{chainError ? 'Wrong Network' : 'Error connecting'}</HeaderRow>
          <ContentWrapper>
            {chainError ? (
              <h5>
                Please connect to the{' '}
                {isTestnetEnvironment()
                  ? 'StarkNet Testnet'
                  : isProductionEnvironment()
                  ? 'StarkNet Mainnet'
                  : 'appropriate StarkNet'}{' '}
                network.
              </h5>
            ) : (
              'Error connecting. Try refreshing the page.'
            )}
          </ContentWrapper>
        </UpperSection>
      )
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      )
    }
    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <HeaderRow color="blue">
            <HoverText
              onClick={() => {
                setPendingError(false)
                setWalletView(WALLET_VIEWS.ACCOUNT)
              }}
            >
              Back
            </HoverText>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <HoverText>Connect to a wallet</HoverText>
          </HeaderRow>
        )}
        <ContentWrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
              setWalletView={setWalletView}
            />
          ) : (
            <OptionGrid>{getOptions()}</OptionGrid>
          )}
          {walletView !== WALLET_VIEWS.PENDING && (
            <Blurb>
              <span>New to Ethereum? &nbsp;</span>{' '}
              <ExternalLink href="https://ethereum.org/wallets/">Learn more about wallets</ExternalLink>
            </Blurb>
          )}
        </ContentWrapper>
      </UpperSection>
    )
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}

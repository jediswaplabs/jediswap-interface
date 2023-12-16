import React, { useCallback, useContext } from 'react'
import { useDispatch } from 'react-redux'
import styled, { ThemeContext } from 'styled-components'
import { AppDispatch } from '../../state'
import { clearAllTransactions } from '../../state/transactions/actions'
import { shortenAddress, shortenStarkID } from '../../utils'
import { AutoRow } from '../Row'
import Copy from './Copy'
import Transaction from './Transaction'

import { SUPPORTED_WALLETS } from '../../constants'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { getStarkscanLink } from '../../utils'
import argentXIcon from '../../assets/images/argentx.png'
import braavosIcon from '../../assets/svg/Braavos.svg'
// import { fortmatic, injected, portis, walletconnect, walletlink } from '../../connectors'
import { ButtonSecondary } from '../Button'
import { ExternalLink as LinkIcon } from 'react-feather'
import { ExternalLink, LinkStyledButton, TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { useConnect, useDisconnect } from '@starknet-react/core'
import { useAccountDetails } from '../../hooks'
import { webWalletUrl } from '../../connectors'

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  /* padding: 2rem 2rem; */
  font-weight: 400;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.jediWhite};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const UpperSection = styled.div`
  position: relative;
  padding: 2rem 2rem 1rem;

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

  &::after {
    content: '';
    width: 100%;
    height: 1px;
    background: linear-gradient(to left, #50d5ff, #ef35ff);
    position: absolute;
    left: 0;
    bottom: 0;
  }
`

const InfoCard = styled.div`
  background: ${({ theme }) => theme.jediNavyBlue};
  padding: 1rem;
  /* border: 1px solid ${({ theme }) => theme.bg3}; */
  border-radius: 8px;
  position: relative;
  display: grid;
  grid-row-gap: 12px;
  /* margin-bottom: 20px; */
`

const AccountGroupingRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.jediWhite};

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }
`

const AccountSection = styled.div`
  background-color: ${({ theme }) => theme.jediNavyBlue};
  /* padding: 0rem 1rem; */
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0rem 1rem 1.5rem 1rem;`}
`

const YourAccount = styled.div`
  h5 {
    margin: 0 0 1rem 0;
    font-weight: 400;
  }

  h4 {
    margin: 0;
    font-weight: 500;
  }
`

const LowerSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  padding: 1rem 2rem 2rem;
  flex-grow: 1;
  overflow: auto;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: ${({ theme }) => theme.jediWhite};
  background-color: ${({ theme }) => theme.jediNavyBlue};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  h5 {
    margin: 0;
    font-weight: 400;
    color: ${({ theme }) => theme.text3};
  }
`

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;

  font-weight: 500;
  font-size: 1.25rem;
  font-family: 'DM Sans', sans-serif;
  color: ${({ theme }) => theme.jediWhite};

  a:hover {
    /* text-decoration: underline; */
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const AddressLink = styled(ExternalLink)<{ hasENS: boolean; isENS: boolean }>`
  font-size: 0.825rem;
  color: ${({ theme }) => theme.jediWhite};
  margin-left: 1rem;
  font-size: 0.825rem;
  display: flex;
  :hover {
    color: ${({ theme }) => theme.text2};
  }
`

const CloseIcon = styled.div`
  color: ${({ theme }) => theme.jediWhite};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.jediWhite};
  }
`

const WalletName = styled.div`
  width: initial;
  font-size: 0.825rem;
  font-weight: 500;
  color: ${({ theme }) => theme.jediWhite};
  font-family: 'DM Sans', sans-serif;
`

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`

const WalletAction = styled(ButtonSecondary)`
  width: fit-content;
  font-weight: 400;
  margin: 0px;
  font-size: 0.825rem;
  padding: 15px;
  border: none;
  background: #141451;
  mix-blend-mode: normal;
  box-shadow: inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
    inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  border-radius: 8px;
  :hover {
    cursor: pointer;
    border: none;
    text-decoration: underline;
  }

  :active,
  :focus {
    box-shadow: inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
      inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
    border: none;
  }
`

const MainWalletAction = styled(WalletAction)`
  color: ${({ theme }) => theme.primary1};
`
export const BorderWrapper = styled.div`
  background: linear-gradient(to left, #50d5ff, #ef35ff);
  padding: 1px;
  border-radius: 8px;
`

const ButtonBorderWrapper = styled(BorderWrapper)`
  background: linear-gradient(to bottom right, #50d5ff, #ef35ff);
  padding: 2px;
`

function renderTransactions(transactions: string[]) {
  return (
    <TransactionListWrapper>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />
      })}
    </TransactionListWrapper>
  )
}

interface AccountDetailsProps {
  toggleWalletModal: () => void
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  openOptions: () => void
}

export default function AccountDetails({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions
}: AccountDetailsProps) {
  const { disconnect } = useDisconnect()
  const { account, chainId, address, connector } = useAccountDetails()
  const connectorType = connector?.id
  const theme = useContext(ThemeContext)
  const dispatch = useDispatch<AppDispatch>()

  function formatConnectorName() {
    return (
      <WalletName>
        {connector &&
          `Connected with ${connectorType === 'argentWebWallet' ? 'Web Wallet' : SUPPORTED_WALLETS[connector.id].name}`}
      </WalletName>
    )
  }

  function getStatusIcon() {
    if (connectorType === 'argentX' || connectorType === 'argentWebWallet') {
      return (
        <IconWrapper size={32}>
          <img src={argentXIcon} alt="argentX" />
        </IconWrapper>
      )
    }

    if (connectorType === 'braavos') {
      return (
        <IconWrapper size={42}>
          <img src={braavosIcon} alt="myBraavos" />
        </IconWrapper>
      )
    }
    return null
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }))
  }, [dispatch, chainId])

  return (
    <>
      <UpperSection>
        <AutoColumn gap="20px">
          <AccountGroupingRow>
            <HeaderRow>Account Overview</HeaderRow>
            <CloseIcon onClick={toggleWalletModal}>
              <CloseColor />
            </CloseIcon>
          </AccountGroupingRow>
          <AccountGroupingRow>
            {formatConnectorName()}
            {(connectorType === 'argentX' || connectorType === 'braavos' || connectorType === 'argentWebWallet') && (
              <ButtonBorderWrapper>
                <WalletAction style={{ fontSize: '.875rem', color: '#9B9B9B' }} onClick={disconnect}>
                  Disconnect
                </WalletAction>
              </ButtonBorderWrapper>
            )}
          </AccountGroupingRow>
          <AccountSection>
            <YourAccount>
              <BorderWrapper>
                <InfoCard>
                  <AccountGroupingRow>
                    <AccountGroupingRow id="web3-account-identifier-row">
                      <AccountControl>
                        {ENSName ? (
                          <>
                            <div>
                              {getStatusIcon()}
                              <p> {shortenStarkID(ENSName)}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              {getStatusIcon()}
                              <p> {address && shortenAddress(address)}</p>
                            </div>
                            {connectorType === 'argentWebWallet' && (
                              <AddressLink hasENS={!!ENSName} isENS={false} href={webWalletUrl}>
                                <LinkIcon size={20} style={{ color: '#50D5FF' }} />
                              </AddressLink>
                            )}
                          </>
                        )}
                      </AccountControl>
                    </AccountGroupingRow>
                    <AccountGroupingRow></AccountGroupingRow>
                  </AccountGroupingRow>
                </InfoCard>
              </BorderWrapper>
            </YourAccount>
          </AccountSection>
          <AccountGroupingRow>
            {ENSName ? (
              <>
                <AccountControl>
                  <div>
                    {address && (
                      <Copy toCopy={address}>
                        <span style={{ marginLeft: '4px' }}>Copy Address</span>
                      </Copy>
                    )}
                    {chainId && address && account && (
                      <AddressLink
                        hasENS={!!ENSName}
                        isENS={true}
                        href={chainId && getStarkscanLink(chainId, ENSName, 'contract')}
                      >
                        <LinkIcon size={16} />
                        <span style={{ marginLeft: '4px' }}>View on Starkscan</span>
                      </AddressLink>
                    )}
                  </div>
                </AccountControl>
              </>
            ) : (
              <>
                <AccountControl>
                  <div>
                    {address && (
                      <Copy toCopy={address}>
                        <span style={{ marginLeft: '8px' }}>Copy Address</span>
                      </Copy>
                    )}
                    {chainId && address && (
                      <AddressLink
                        hasENS={!!ENSName}
                        isENS={false}
                        href={getStarkscanLink(chainId, address, 'contract')}
                      >
                        <LinkIcon size={20} style={{ color: '#50D5FF' }} />
                        <span style={{ marginLeft: '8px' }}>View on Starkscan</span>
                      </AddressLink>
                    )}
                  </div>
                </AccountControl>
              </>
            )}
          </AccountGroupingRow>
        </AutoColumn>
      </UpperSection>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <AutoRow mb={'1rem'} style={{ justifyContent: 'space-between' }}>
            <TYPE.body color={'#FFFFFF'}>Recent Transactions</TYPE.body>
            <LinkStyledButton onClick={clearAllTransactionsCallback}>Clear all</LinkStyledButton>
          </AutoRow>
          {renderTransactions(pendingTransactions)}
          {renderTransactions(confirmedTransactions)}
        </LowerSection>
      ) : (
        <LowerSection>
          <TYPE.body
            color={theme.jediWhite}
            fontFamily={'DM Sans'}
            letterSpacing={'0px'}
            fontSize={14}
            fontWeight={400}
          >
            Your transactions will appear here...
          </TYPE.body>
        </LowerSection>
      )}
    </>
  )
}

import React, { FC } from 'react'
import styled from 'styled-components'
import Option from './Option'
import { SUPPORTED_WALLETS, WalletInfo } from '../../constants'
// import { injected } from '../../connectors'
import { darken } from 'polished'
import Loader from '../Loader'
import { BorderWrapper } from '../AccountDetails'
import { NoStarknetProviderError as NoArgentXProviderError } from '@web3-starknet-react/argentx-connector'
import { NoStarknetProviderError as NoBraavosProviderError } from '@web3-starknet-react/braavos-connector'
import { WALLET_VIEWS } from '.'
import { AutoColumn } from '../Column'
import { ButtonOutlined } from '../Button'
import { RowStart } from '../Row'
import { InjectedConnector } from '@starknet-react/core'

const PendingSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: 'DM Sans', sans-serif;
  color: ${({ theme }) => theme.jediWhite};
  background: ${({ theme }) => theme.jediNavyBlue};
  & > * {
    width: 100%;
  }
`

const StyledLoader = styled(Loader)`
  margin-right: 1rem;
`

const LoadingMessage = styled.div<{ error?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: ${({ error }) => (error ? 'center' : 'flex-start')};
  border-radius: 8px;
  padding:10px 0;
  /* margin-bottom: 20px; */
  color: ${({ theme, error }) => (error ? theme.red1 : 'inherit')};
  background: ${({ theme }) => theme.jediNavyBlue};
  /* border: 1px solid ${({ theme, error }) => (error ? theme.red1 : theme.text4)}; */

  & > * {
    padding: 1rem 0rem;
  }
`

const ErrorGroup = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: flex-start;
`

const StarknetErrorGroup = styled(ErrorGroup)`
  justify-content: space-between;
  gap: 24px;
`

const ErrorButton = styled.div`
  border-radius: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: transparent;
  margin-left: 25px;
  padding: 0.5rem;
  font-weight: 600;
  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: transparent;
  }
`

const StarknetDownloadButton = styled(ButtonOutlined)`
  font-size: 12px;
  padding: 0.5rem;
  font-family: 'DM Sans';
  font-weight: 600;
  border-color: #ff875b;
  color: ${({ theme }) => theme.jediWhite};
  flex: 1;

  &:hover {
    border-color: ${({ theme }) => theme.jediBlue};
    box-shadow: none;
  }
`

const StarknetWalletNote = styled.div`
  font-size: 12px;
  /* max-width: 70%; */
  /* color: ${({ theme }) => theme.jediBlue}; */
`

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.jediNavyBlue};
`

export default function PendingView({
  connector,
  error = false,
  setPendingError,
  setWalletView,
  tryActivation
}: {
  connector?: WalletInfo
  error?: any
  setPendingError: (error: boolean) => void
  setWalletView: (walletView: string) => void
  tryActivation: (option: WalletInfo) => void
}) {
  const isArgentXProviderError = error === 'argentX'

  const isBraavosProviderError = error === 'braavos'

  const isStarknetProviderError = isArgentXProviderError || isBraavosProviderError

  return (
    <PendingSection>
      <BorderWrapper>
        <LoadingMessage error={error}>
          <LoadingWrapper>
            {error ? (
              isStarknetProviderError ? (
                <ProviderError
                  error={error}
                  onClick={() => {
                    setPendingError(false)
                    setWalletView(WALLET_VIEWS.OPTIONS)
                  }}
                />
              ) : (
                <ErrorGroup>
                  <div>Error connecting.</div>
                  <ErrorButton
                    onClick={() => {
                      setPendingError(false)
                      connector && tryActivation(connector)
                    }}
                  >
                    Try Again
                  </ErrorButton>
                </ErrorGroup>
              )
            ) : (
              <RowStart style={{ paddingLeft: '16px' }}>
                <StyledLoader />
                Initializing...
              </RowStart>
            )}
          </LoadingWrapper>
        </LoadingMessage>
      </BorderWrapper>
      {Object.keys(SUPPORTED_WALLETS).map(key => {
        const option = SUPPORTED_WALLETS[key]
        if (option.connector === connector) {
          return (
            <BorderWrapper key={key}>
              <Option
                id={`connect-${key}`}
                clickable={false}
                color={option.color}
                header={option.name}
                subheader={option.description}
                icon={option.icon}
              />
            </BorderWrapper>
          )
        }
        return null
      })}
    </PendingSection>
  )
}

interface ProviderErrorProps {
  error: string
  onClick: () => void
}

const ProviderError: FC<ProviderErrorProps> = ({ error, onClick }) => {
  const argentXUrl =
    'https://chrome.google.com/webstore/detail/argent-x-starknet-wallet/dlcobpjiigpikoobohmabehhmhfoodbb'

  const braavosUrl = 'https://chrome.google.com/webstore/detail/braavos-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma'

  const downloadArgentX = () => window.open(argentXUrl, '_blank')

  const downloadBraavos = () => window.open(braavosUrl, '_blank')

  const isArgentXError = error === 'argentX'

  return (
    <StarknetErrorGroup>
      <AutoColumn gap="4px">
        <div>{`${isArgentXError ? 'ArgentX' : 'Braavos'} wallet not found`}</div>
        <StarknetWalletNote>( Setup wallet and refresh )</StarknetWalletNote>
      </AutoColumn>
      <StarknetDownloadButton
        onClick={() => {
          isArgentXError ? downloadArgentX() : downloadBraavos()
          onClick()
        }}
      >
        Download now
      </StarknetDownloadButton>
    </StarknetErrorGroup>
  )
}

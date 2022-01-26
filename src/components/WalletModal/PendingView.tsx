import { AbstractConnector } from '@web3-starknet-react/abstract-connector'
import React from 'react'
import styled from 'styled-components'
import Option from './Option'
import { SUPPORTED_WALLETS } from '../../constants'
// import { injected } from '../../connectors'
import { darken } from 'polished'
import Loader from '../Loader'
import { BorderWrapper } from '../AccountDetails'
const PendingSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: DM Sans;
  letter-spacing: 0ch;
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
  justify-content: flex-start;
  border-radius: 8px;
  padding:10px 0;
  /* margin-bottom: 20px; */
  color: ${({ theme, error }) => (error ? theme.red1 : 'inherit')};
  background: ${({ theme }) => theme.jediNavyBlue};
  /* border: 1px solid ${({ theme, error }) => (error ? theme.red1 : theme.text4)}; */

  & > * {
    padding: 1rem;
  }
`

const ErrorGroup = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: flex-start;
`

const ErrorButton = styled.div`
  border-radius: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg4};
  margin-left: 1rem;
  padding: 0.5rem;
  font-weight: 600;
  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => darken(0.1, theme.text4)};
  }
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
  tryActivation
}: {
  connector?: AbstractConnector
  error?: boolean
  setPendingError: (error: boolean) => void
  tryActivation: (connector: AbstractConnector) => void
}) {
  const isMetamask = window?.ethereum?.isMetaMask

  return (
    <PendingSection>
      <BorderWrapper>
        <LoadingMessage error={error}>
          <LoadingWrapper>
            {error ? (
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
            ) : (
              <>
                <StyledLoader />
                Initializing...
              </>
            )}
          </LoadingWrapper>
        </LoadingMessage>
      </BorderWrapper>
      {Object.keys(SUPPORTED_WALLETS).map(key => {
        const option = SUPPORTED_WALLETS[key]
        if (option.connector === connector) {
          // if (option.connector === injected) {
          //   if (isMetamask && option.name !== 'MetaMask') {
          //     return null
          //   }
          //   if (!isMetamask && option.name === 'MetaMask') {
          //     return null
          //   }
          // }
          return (
            <BorderWrapper>
              <Option
                id={`connect-${key}`}
                key={key}
                clickable={false}
                color={option.color}
                header={option.name}
                subheader={option.description}
                icon={require('../../assets/images/' + option.iconName)}
              />
            </BorderWrapper>
          )
        }
        return null
      })}
    </PendingSection>
  )
}

import React, { useCallback, useEffect, useState } from 'react'
import { AbstractConnector } from '@web3-starknet-react/abstract-connector'
import { UnsupportedChainIdError, useStarknetReact } from '@web3-starknet-react/core'
import AppBody from '../AppBody'
import { Wrapper, HeaderRow, HeaderInfo } from './styleds'
import styled from 'styled-components'
import Column, { AutoColumn } from '../../components/Column'
import { BorderWrapper } from '../../components/AccountDetails'

import MetaMask from './MetaMask'
import Argent from './Argent'

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
  const { error } = useStarknetReact()

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
                <BorderWrapper>
                  <Argent color={''} header={undefined} subheader={undefined} icon={''} id={''} />
                </BorderWrapper>
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

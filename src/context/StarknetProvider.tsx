// @ts-nocheck

'use client'
import React, { useMemo } from 'react'

import { goerli, mainnet, sepolia } from '@starknet-react/chains'
import { StarknetConfig, publicProvider } from '@starknet-react/core'
import { WebWalletConnector } from 'starknetkit/webwallet'
import { InjectedConnector } from 'starknetkit/injected'
import rpcProvider from '../utils/getLibrary'
import { isTestnetEnvironment } from '../connectors'

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [mainnet, goerli, sepolia]
  const connectors = useMemo(
    () => [
      new InjectedConnector({
        options: {
          id: 'argentX',
          name: 'Argent X'
        }
      }),
      new WebWalletConnector({
        url: isTestnetEnvironment() ? 'https://web.hydrogen.argent47.net' : 'https://web.argent.xyz/'
      }),
      new InjectedConnector({
        options: {
          id: 'braavos',
          name: 'Braavos'
        }
      })
    ],
    []
  )

  return (
    <StarknetConfig chains={chains} connectors={connectors} provider={rpcProvider} autoConnect>
      {children}
    </StarknetConfig>
  )
}

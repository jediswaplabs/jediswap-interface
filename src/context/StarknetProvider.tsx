'use client'
import React from 'react'

import { goerli, mainnet } from '@starknet-react/chains'
import { StarknetConfig, argent, braavos, useInjectedConnectors } from '@starknet-react/core'
import rpcProvider from '../utils/getLibrary'

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [mainnet, goerli]
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [argent(), braavos()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: 'onlyIfNoConnectors',
    // Randomize the order of the connectors.
    order: 'random'
  })

  return (
    <StarknetConfig chains={chains} connectors={connectors} provider={rpcProvider} autoConnect>
      {children}
    </StarknetConfig>
  )
}

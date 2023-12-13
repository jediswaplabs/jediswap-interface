// @ts-nocheck

'use client'
import React, {useMemo} from 'react'

import { goerli, mainnet } from '@starknet-react/chains'
import { StarknetConfig, argent, braavos, useInjectedConnectors } from '@starknet-react/core'
import { WebWalletConnector } from "starknetkit/webwallet";
import rpcProvider from '../utils/getLibrary'
import { isTestnetEnvironment } from '../connectors'

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [mainnet, goerli]
  const connectors = useMemo(() => [
    argent(),
    new WebWalletConnector({
        url: isTestnetEnvironment() ? "https://web.hydrogen.argent47.net" : "https://web.argent.xyz/",
    }),
    braavos()
  ], []);

  return (
    <StarknetConfig chains={chains} connectors={connectors} provider={rpcProvider} autoConnect>
      {children}
    </StarknetConfig>
  )
}

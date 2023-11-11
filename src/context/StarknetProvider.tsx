// import React, { FunctionComponent } from 'react'
// import { createContext, useMemo } from 'react'
// import { Provider, RpcProvider, RpcProviderOptions } from 'starknet'

// type ProviderConfig = {
//   provider: RpcProvider | null
// }

// export const ProviderContext = createContext<ProviderConfig>({
//   provider: null
// })

// export const StarknetProvider: FunctionComponent = ({ children }) => {
//   const provider = useMemo(() => {
//     return new RpcProvider({
//       nodeUrl: 'https://starknet-mainnet-rpc.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c'
//     })
//   }, [])

//   const contextValues = useMemo(() => {
//     return {
//       provider
//     }
//   }, [provider])

//   return <ProviderContext.Provider value={contextValues}>{children}</ProviderContext.Provider>
// }

'use client'
import React from 'react'

import { goerli, mainnet } from '@starknet-react/chains'
import { StarknetConfig, publicProvider, argent, braavos, useInjectedConnectors } from '@starknet-react/core'
import rpcProvider from '../utils/getLibrary'

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [goerli, mainnet]
  const providers = [publicProvider()]
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [argent(), braavos()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: 'onlyIfNoConnectors',
    // Randomize the order of the connectors.
    order: 'random'
  })

  return (
    <StarknetConfig chains={chains} connectors={connectors} providers={providers} autoConnect>
      {children}
    </StarknetConfig>
  )
}

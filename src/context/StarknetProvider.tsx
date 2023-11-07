import React, { FunctionComponent } from 'react'
import { createContext, useMemo } from 'react'
import { Provider, RpcProvider, RpcProviderOptions } from 'starknet'

type ProviderConfig = {
  provider: RpcProvider | null
}

export const ProviderContext = createContext<ProviderConfig>({
  provider: null
})

export const StarknetProvider: FunctionComponent = ({ children }) => {
  const provider = useMemo(() => {
    return new RpcProvider({
      nodeUrl: 'https://starknet-mainnet-rpc.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c'
    })
  }, [])

  const contextValues = useMemo(() => {
    return {
      provider
    }
  }, [provider])

  return <ProviderContext.Provider value={contextValues}>{children}</ProviderContext.Provider>
}

import { useMemo } from 'react'
import { AccountStatus, Connector, useAccount, useProvider } from '@starknet-react/core'
import { ChainId } from '@jediswap/sdk'
import { useChain } from 'react-spring'
import { AccountInterface } from 'starknet'
import { useQuery } from 'react-query'

export const useAccountDetails = (): {
  account: AccountInterface | undefined
  address: string | undefined
  isConnected: boolean | undefined
  chainId: ChainId | undefined
  connector: Connector | undefined
  status: AccountStatus
} => {
  const { account, address, isConnected, status, connector } = useAccount()

  const { provider } = useProvider()

  const connectedChainId = useQuery({
    queryKey: [`get_chainId/${address}`],
    queryFn: async () => {
      if (!address) return
      const results: any = await provider.getChainId()
      return results
    }
  })

  console.log(connectedChainId.data, 'dfkdnkfn')

  const chainId = useMemo(() => {
    if (!connectedChainId || !connectedChainId.data) return undefined
    return connectedChainId.data
  }, [connectedChainId, address])

  return { account, address, isConnected, chainId, connector, status }
}

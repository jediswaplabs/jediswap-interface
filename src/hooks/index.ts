import { useMemo } from 'react'
import { useAccount } from '@starknet-react/core'
import { ChainId } from '@jediswap/sdk'

export const useAccountDetails = () => {
  const { account, address, connector, status } = useAccount()
  const chainId = ChainId.SN_MAIN
  return useMemo(() => {
    return { address, connector, chainId, account, status }
  }, [account])
}

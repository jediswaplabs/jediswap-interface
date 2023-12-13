import { useMemo } from 'react'
import { useAccount } from '@starknet-react/core'
import { ChainId } from '@jediswap/sdk'
import {useChain} from "react-spring";

export const useAccountDetails = () => {
  const { account, address, connector, status } = useAccount()
  const chainId = account?.chainId ?? account?.provider?.chainId;

  return useMemo(() => {
    return { address, connector, chainId, account, status }
  }, [account])
}

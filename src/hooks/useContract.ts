import { Contract } from 'starknet'
import { useMemo } from 'react'
import { getContract } from '../utils'
import { useActiveStarknetReact } from './index'

import ERC20_ABI from '../constants/abis/erc20.json'
import PAIR_ABI from '../constants/abis/Pair.json'

import { MULTICALL_NETWORKS, MULTICALL_ABI } from '../constants/multicall'
import { FACTORY_ADDRESS, FACTORY_ABI } from '../constants/factoryAddress'
import { ROUTER_ADDRESS, ROUTER_ABI } from '../constants/routerAddress'
import { ZAP_IN_ADDRESS, ZAP_IN_ABI } from '../constants/zapInAddress'


// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account, connector } = useActiveStarknetReact()

  return useMemo(() => {
    if (!address || !ABI || !library) return null

    try {
      const contract = getContract(address, ABI, library, connector)

      return contract
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, connector])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, PAIR_ABI, withSignerIfPossible)
}
//Change here
export function useFactoryContract(): Contract | null {
  const { chainId } = useActiveStarknetReact()

  return useContract(FACTORY_ADDRESS[chainId ?? 5], FACTORY_ABI, true)
}
//Change Here
export function useRouterContract(): Contract | null {
  const { chainId } = useActiveStarknetReact()

  return useContract(ROUTER_ADDRESS[chainId ?? 5], ROUTER_ABI, true)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveStarknetReact()

  return useContract(MULTICALL_NETWORKS[chainId ?? 5], MULTICALL_ABI, false)
}
//Change Here
export function useZapInContract(): Contract | null {
  const { chainId } = useActiveStarknetReact()

  return useContract(ZAP_IN_ADDRESS[chainId ?? 5], ZAP_IN_ABI, true)
}

import { Contract } from 'starknet'
import JediswapPairABI from '../constants/abis/Pair.json'
import { useMemo } from 'react'
import ERC20_ABI from '../constants/abis/erc20.json'
import { getContract } from '../utils'
import { useActiveStarknetReact } from './index'
import { ROUTER_ADDRESS, ZAP_IN_ADDRESS } from '../constants'
import JediSwapRouterABI from '../constants/abis/Router.json'
import { MULTICALL_NETWORKS, MULTICALL_ABI } from '../constants/multicall'
import JediSwapZapInABI from '../constants/abis/ZapIn.json'
import { FACTORY_ADDRESS } from '@jediswap/sdk'
import FACTORY_ABI from '../constants/abis/Factory.json'

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
  return useContract(pairAddress, JediswapPairABI, withSignerIfPossible)
}

export function useFactoryContract(): Contract | null {
  return useContract(FACTORY_ADDRESS, FACTORY_ABI, true)
}

export function useRouterContract(): Contract | null {
  return useContract(ROUTER_ADDRESS, JediSwapRouterABI, true)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveStarknetReact()

  return useContract(MULTICALL_NETWORKS[chainId ?? 5], MULTICALL_ABI, false)
}

export function useZapInContract(): Contract | null {
  return useContract(ZAP_IN_ADDRESS, JediSwapZapInABI, true)
}

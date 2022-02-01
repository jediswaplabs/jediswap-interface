import { Contract } from '@jediswap/starknet'
import JediswapPairABI from '../constants/abis/Pair.json'
import { useMemo } from 'react'
import ERC20_ABI from '../constants/abis/erc20.json'
import { getContract } from '../utils'
import { useActiveStarknetReact } from './index'
import REGISTRY_ABI from '../constants/abis/Registry.json'
import { REGISTRY_ADDRESS, ROUTER_ADDRESS } from '../constants'
import JediSwapRouterABI from '../constants/abis/Router.json'
import { MULTICALL_NETWORKS, MULTICALL_ABI } from '../constants/multicall'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account, connector } = useActiveStarknetReact()

  return useMemo(() => {
    if (!address || !ABI || !library) {
      // console.log(
      //   '🚀 ~ file: useContract.ts ~ line 32 ~ returnuseMemo ~ !address || !ABI || !library',
      //   address,
      //   ABI,
      //   library
      // )
      return null
    }
    try {
      const contract = getContract(
        address,
        ABI,
        library,
        connector,
        withSignerIfPossible && account ? account : undefined
      )

      return contract
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, JediswapPairABI, withSignerIfPossible)
}

export function useRegistryContract(withSignerIfPossible?: boolean): Contract | null {
  return useContract(REGISTRY_ADDRESS, REGISTRY_ABI, withSignerIfPossible)
}

export function useRouterContract(): Contract | null {
  return useContract(ROUTER_ADDRESS, JediSwapRouterABI, true)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveStarknetReact()

  return useContract(MULTICALL_NETWORKS[chainId ?? 5], MULTICALL_ABI, false)
}

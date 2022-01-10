import { Contract } from 'starknet'
import JediswapPairABI from '../constants/abis/Pair.json'
import { useMemo } from 'react'
import ERC20_ABI from '../constants/abis/erc20.json'
import { getContract } from '../utils'
import { useActiveStarknetReact } from './index'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveStarknetReact()

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
      const contract = getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)

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

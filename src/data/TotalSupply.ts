import { BigNumber } from '@ethersproject/bignumber'
import { Token, TokenAmount } from '@jediswap/sdk'
import { uint256 } from 'starknet'
import { useTokenContract } from '../hooks/useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useTotalSupply(token?: Token): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const totalSupply = useSingleCallResult(contract, 'totalSupply')?.result?.[0]
  // const totalSupply = useStarknetCall(contract, 'totalSupply')?.totalSupply

  return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined
}

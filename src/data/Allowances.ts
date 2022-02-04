import { uint256 } from '@jediswap/starknet'
import { Token, TokenAmount } from '@jediswap/sdk'
import { useMemo } from 'react'

import { useTokenContract } from '../hooks/useContract'
import { useStarknetCall } from '../hooks/useStarknet'
import { useSingleCallResult } from '../state/multicall/hooks'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => ({ owner: owner ?? '', spender: spender ?? '' }), [owner, spender])

  const allowance = useSingleCallResult(contract, 'allowance', inputs).result
  console.log('🚀 ~ file: Allowances.ts ~ line 15 ~ useTokenAllowance ~ allowance', allowance)

  // const uint256Allowance: uint256.Uint256 = { low: allowanceResult?.result?.[0], high: allowanceResult?.result?.[1] }

  // const allowance = allowanceResult ? uint256.uint256ToBN(uint256Allowance) : undefined

  return useMemo(() => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined), [
    token,
    allowance
  ])
}

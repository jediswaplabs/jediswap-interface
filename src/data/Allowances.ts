import { uint256 } from 'starknet'
import { Token, TokenAmount } from '@jediswap/sdk'
import { useMemo } from 'react'

import { useTokenContract } from '../hooks/useContract'
import { useStarknetCall } from '../hooks/useStarknet'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])

  const allowanceResult = useStarknetCall(contract, 'allowance', inputs).remaining

  const allowance = allowanceResult ? uint256.uint256ToBN(allowanceResult as any) : undefined

  return useMemo(() => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined), [
    token,
    allowance
  ])
}

import { Token, TokenAmount } from '@uniswap/sdk'
import { useMemo } from 'react'

import { useTokenContract } from '../hooks/useContract'
import { useStarknetCall } from '../hooks/useStarknet'

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  // const allowance = useSingleCallResult(contract, 'allowance', inputs).result
  const allowance = useStarknetCall(contract, 'allowance', inputs).remaining as string
  console.log('🚀 ~ file: Allowances.ts ~ line 14 ~ useTokenAllowance ~ allowance ', allowance)

  return useMemo(() => (token && allowance ? new TokenAmount(token, allowance) : undefined), [token, allowance])
}

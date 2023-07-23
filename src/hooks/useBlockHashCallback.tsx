import { useCallback, useState, useEffect } from 'react'
import { useAccount, useBlock } from '@starknet-react/core'

export function useBlockHash(blockNumber: number | undefined): string | undefined {
  const [blockHash, setBlockHash] = useState<string | undefined>(undefined)
  const { data } = useBlock({
    refetchInterval: false,
    blockIdentifier: 'latest'
  })
  const blockhashCallback = useCallback(async () => {
    setBlockHash(data?.block_hash)
  }, [blockNumber])

  useEffect(() => {
    blockhashCallback()
  }, [blockhashCallback])

  return blockHash
}

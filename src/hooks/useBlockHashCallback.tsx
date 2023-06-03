import { useCallback, useState, useEffect } from 'react'
import { useAccount } from '@starknet-react/core'

export function useBlockHash(blockNumber: number | undefined): string | undefined {
  const { account } = useAccount()
  const [blockHash, setBlockHash] = useState<string | undefined>(undefined)

  const blockhashCallback = useCallback(async () => {
    const block = await account?.getBlock(blockNumber)

    setBlockHash(block?.block_hash)
  }, [blockNumber])

  useEffect(() => {
    blockhashCallback()
  }, [blockhashCallback])

  return blockHash
}

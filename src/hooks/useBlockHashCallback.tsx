import { useCallback, useState, useEffect } from 'react'
import { useStarknet } from '@starknet-react/core'

export function useBlockHash(blockNumber: number | undefined): string | undefined {
  const { library } = useStarknet()
  const [blockHash, setBlockHash] = useState<string | undefined>(undefined)

  const blockhashCallback = useCallback(async () => {
    const block = await library?.getBlock(blockNumber)

    setBlockHash(block?.block_hash)
  }, [blockNumber])

  useEffect(() => {
    blockhashCallback()
  }, [blockhashCallback])

  return blockHash
}

import { useCallback, useState, useEffect } from 'react'
import { useActiveStarknetReact } from '.'

export function useBlockHash(blockNumber: number | undefined): string | undefined {
  const { library } = useActiveStarknetReact()
  const [blockHash, setBlockHash] = useState<string | undefined>(undefined)

  const blockhashCallback = useCallback(async () => {
    const block = await library?.getBlock(blockNumber)

    setBlockHash(block?.block_hash)
  }, [blockNumber, library])

  useEffect(() => {
    blockhashCallback()
  }, [blockhashCallback])

  return blockHash
}

import { useCallback, useState, useEffect } from 'react'
import { useActiveStarknetReact } from '.'

export function useBlockHash(blockNumber: number | undefined): string | undefined {
  const { library } = useActiveStarknetReact()
  const [blockHash, setBlockHash] = useState<string | undefined>(undefined)

  const blockhashCallback = useCallback(async () => {
    const block = await library?.getBlock(undefined, blockNumber)
    console.log('🚀 ~ file: useBlockHashCallback.tsx ~ line 10 ~ blockhashCallback ~ block', block)

    setBlockHash(block?.block_hash)
  }, [blockNumber, library])

  useEffect(() => {
    blockhashCallback()
  }, [blockhashCallback])

  return blockHash
}

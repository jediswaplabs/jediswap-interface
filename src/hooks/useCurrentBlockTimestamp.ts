import { useEffect, useState, useCallback } from 'react'
// import { BigNumber } from 'ethers'
import { useActiveStarknetReact } from './index'
import { useBlockNumber } from '../state/application/hooks'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): number | undefined {
  // const multicall = useMulticallContract()
  // return useSingleCallResult(multicall, 'getCurrentBlockTimestamp')?.result?.[0]
  const { library } = useActiveStarknetReact()
  const blockNumber = useBlockNumber()

  const [timestamp, setTimeStamp] = useState<number | undefined>(undefined)

  const callBlockTimestamp = useCallback(() => {
    if (library && blockNumber) {
      library.getBlock().then(block => setTimeStamp(block.timestamp))
    }
    return undefined
  }, [library, blockNumber])

  useEffect(() => {
    callBlockTimestamp()
  }, [library, blockNumber])

  return timestamp
}

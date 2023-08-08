import { useEffect, useState, useCallback } from 'react'
// import { BigNumber } from 'ethers'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useMulticallContract } from './useContract'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): number | undefined {
  const multicall = useMulticallContract()
  return useSingleCallResult(multicall, 'get_current_block_timestamp')?.result?.[0]
}

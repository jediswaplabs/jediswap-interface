import { getChecksumAddress } from 'starknet'
import { AppState } from './../index'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'

export function useAllPairs(): string[] {
  const allPairs = useSelector<AppState, AppState['pairs']['allPairs']>(state => state.pairs.allPairs)

  return useMemo(() => allPairs.map(pairAddress => getChecksumAddress(pairAddress)), [allPairs])
}

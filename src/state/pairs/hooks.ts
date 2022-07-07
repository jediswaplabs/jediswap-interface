import { validateAndParseAddress } from 'starknet'
import { AppState } from './../index'
import { useSelector } from 'react-redux'

export function useAllPairs(): string[] {
  const allPairs = useSelector<AppState, AppState['pairs']['allPairs']>(state => state.pairs.allPairs)

  return allPairs.map(pairAddress => validateAndParseAddress(pairAddress))
}

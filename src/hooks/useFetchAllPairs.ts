import { updateAllPairs } from './../state/pairs/actions'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useFactoryContract } from './useContract'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../state'
import { useCallback } from 'react'

export default function useFetchAllPairsCallback() {
  const factoryContract = useFactoryContract()
  const dispatch = useDispatch<AppDispatch>()
  const allPairs = useSingleCallResult(factoryContract, 'get_all_pairs').result

  return useCallback(() => {
    if (!allPairs || !Array.isArray(allPairs.all_pairs)) {
      return
    }
    dispatch(updateAllPairs({ allPairs: allPairs.all_pairs }))
  }, [allPairs, dispatch])
}

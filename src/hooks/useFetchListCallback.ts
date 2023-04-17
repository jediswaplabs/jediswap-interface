import { nanoid } from '@reduxjs/toolkit'
import { ChainId } from '@jediswap/sdk'
import { TokenList } from '@jediswap/token-lists'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { NETWORK_CHAIN_ID } from '../connectors'
import { AppDispatch } from '../state'
import { fetchTokenList } from '../state/lists/actions'
import getTokenList from '../utils/getTokenList'
import resolveENSContentHash from '../utils/resolveENSContentHash'
import { useActiveStarknetReact } from './index'

export function useFetchListCallback(): (listUrl: string) => Promise<TokenList> {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    async (listUrl: string) => {
      const requestId = nanoid()
      dispatch(fetchTokenList.pending({ requestId, url: listUrl }))
      return getTokenList(listUrl)
        .then(tokenList => {
          dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }))
          return tokenList
        })
        .catch(error => {
          console.debug(`Failed to get list at url ${listUrl}`, error)
          dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }))
          throw error
        })
    },
    [dispatch]
  )
}

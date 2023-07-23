import { useCallback, useEffect, useState } from 'react'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { updateBlockNumber } from './actions'
import { useDispatch } from 'react-redux'
import { useAccount } from '@starknet-react/core'
import { StarknetChainId } from 'starknet/dist/constants'
import { useAccountDetails } from '../../hooks'

export default function Updater(): null {
  const { account, chainId } = useAccountDetails()
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{ chainId: StarknetChainId | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null
  })

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState(state => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId, blockNumber }
          return { chainId, blockNumber: Math.max(blockNumber, state.blockNumber) }
        }
        return state
      })
    },
    [chainId, setState]
  )

  // attach/detach listeners
  useEffect(() => {
    if (!account || !chainId || !windowVisible) return undefined

    setState({ chainId, blockNumber: null })

    account
      .getBlock('latest')
      .then(block => blockNumberCallback(Number(block.block_number)))
      .catch(error => console.error(`Failed to get block number for chainId: ${chainId}`, error))

    const interval = setInterval(() => {
      account
        .getBlock('latest')
        .then(block => blockNumberCallback(Number(block.block_number)))
        .catch(error => console.error(`Failed to get block number for chainId: ${chainId}`, error))
    }, 15000)
    return () => {
      clearInterval(interval)
    }
  }, [dispatch, chainId, account, blockNumberCallback, windowVisible])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}

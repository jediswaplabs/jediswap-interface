import { useCallback, useEffect, useState } from 'react'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { updateBlockNumber } from './actions'
import { useDispatch } from 'react-redux'
import { useAccount, useStarknet } from '@starknet-react/core'

export default function Updater(): null {
  const { library } = useStarknet()
  const { account } = useAccount()
  const chainId = account?.chainId
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
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
    if (!library || !chainId || !windowVisible) return undefined

    setState({ chainId, blockNumber: null })

    library
      .getBlock('latest')
      .then(block => blockNumberCallback(Number(block.block_number)))
      .catch(error => console.error(`Failed to get block number for chainId: ${chainId}`, error))

    const interval = setInterval(() => {
      library
        .getBlock('latest')
        .then(block => blockNumberCallback(Number(block.block_number)))
        .catch(error => console.error(`Failed to get block number for chainId: ${chainId}`, error))
    }, 15000)
    return () => {
      clearInterval(interval)
    }
  }, [dispatch, chainId, library, blockNumberCallback, windowVisible])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}

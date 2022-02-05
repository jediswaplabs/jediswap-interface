import { Provider as Web3Provider } from '@jediswap/starknet'
import { ChainId } from '@jediswap/sdk'
import { useStarknetReact as useStarknetReactCore } from '@web3-starknet-react/core'
import { StarknetReactContextInterface } from '@web3-starknet-react/core/dist/types'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { argentX } from '../connectors'
import { NetworkContextName } from '../constants'

export function useActiveStarknetReact(): StarknetReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useStarknetReactCore<Web3Provider>()
  const contextNetwork = useStarknetReactCore<Web3Provider>(NetworkContextName)
  return context.active ? context : contextNetwork
}

export function useEagerConnect() {
  const { activate, active } = useStarknetReactCore() // specifically using useStarknetReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    argentX.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(argentX, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.starknet) {
          activate(argentX, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and argentX - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useStarknetReactCore() // specifically using useStarknetReact because of what this hook does

  useEffect(() => {
    const { starknet } = window

    if (starknet && starknet.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(argentX, undefined, true).catch(error => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(argentX, undefined, true).catch(error => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      // starknet.on('chainChanged', handleChainChanged)
      starknet.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (starknet) {
          // ethereum.removeListener('chainChanged', handleChainChanged)
          starknet.off('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}

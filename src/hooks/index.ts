import { ArgentXConnector } from '@web3-starknet-react/argentx-connector'
import { Provider as Web3Provider } from 'starknet'
import { useStarknetReact as useStarknetReactCore } from '@web3-starknet-react/core'
import { StarknetReactContextInterface } from '@web3-starknet-react/core/dist/types'
import { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { argentX, braavosWallet } from '../connectors'
import { NetworkContextName, SUPPORTED_WALLETS } from '../constants'
import { BraavosConnector } from '@web3-starknet-react/braavos-connector'
import { InjectedConnector, useAccount, useConnectors, useBalance } from '@starknet-react/core'

// deprecating this hook because we don't require it anymore

// export function useActiveStarknetReact(): StarknetReactContextInterface<Web3Provider> & { chainId?: ChainId } {
//   const context = useStarknetReactCore<Web3Provider>()
//   const contextNetwork = useStarknetReactCore<Web3Provider>(NetworkContextName)
//   return context.active ? context : contextNetwork
// }

export const useAccountDetails = () => {
  const { account } = useAccount()
  return useMemo(() => {
    return { account, chainId: account?.chainId || account?.provider?.chainId }
  }, [account])
}

export function useEagerConnect() {
  const { activate, active } = useStarknetReactCore() // specifically using useStarknetReactCore because of what this hook does
  const [tried, setTried] = useState(false)
  const { connect } = useConnectors()

  const injected = localStorage.getItem('auto-injected-wallet')

  let connector: InjectedConnector | undefined

  if (injected === 'argentX') {
    connector = argentX
  } else if (injected === 'braavos') {
    connector = braavosWallet
  }

  useEffect(() => {
    if (connector) {
      connect(connector)
    }
  }, [connector])

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (!connector) return

  //     connector.isAuthorized().then(isAuthorized => {
  //       if (isAuthorized && connector) {
  //         activate(connector, undefined, true).catch(() => {
  //           setTried(true)
  //         })
  //       } else {
  //         if (isMobile && window.starknet && connector) {
  //           activate(connector, undefined, true).catch(() => {
  //             setTried(true)
  //           })
  //         } else {
  //           setTried(true)
  //         }
  //       }
  //     })
  //   }, 100)
  // }, [activate, connector]) // intentionally only running on mount (make sure it's only mounted once :))

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
  const { connector } = useAccount()
  const { connect } = useConnectors()

  useEffect(() => {
    const { starknet, starknet_braavos } = window

    if (starknet && !active && !error && !suppress && connector) {
      const activeConnector = connector instanceof InjectedConnector ? argentX : braavosWallet

      const handleChainChanged = () => {
        // eat errors
        connect(activeConnector)
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          connect(activeConnector)
        }
      }

      // starknet.on('chainChanged', handleChainChanged)
      // starknet.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (starknet) {
          // ethereum.removeListener('chainChanged', handleChainChanged)
          starknet.off('accountsChanged', handleAccountsChanged)
        }

        if (starknet_braavos) {
          starknet_braavos.off('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate, connector])
}

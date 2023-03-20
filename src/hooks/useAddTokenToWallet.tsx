import { ArgentXConnector } from '@web3-starknet-react/argentx-connector'
import { BraavosConnector } from '@web3-starknet-react/braavos-connector'
import { useCallback } from 'react'
import { useActiveStarknetReact } from '.'

export function useAddTokenToWallet(): (tokenAddress: string) => void {
  const { connector } = useActiveStarknetReact()
  return useCallback(
    async (tokenAddress: string) => {
      if (connector) {
        if (connector instanceof ArgentXConnector) {
          try {
            await window.starknet?.request({
              type: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  address: tokenAddress
                }
              }
            })
          } catch (error) {
            console.log(error)
          }
        } else if (connector instanceof BraavosConnector) {
          const wallet = [window.starknet, window.starknet_braavos].find(obj => obj?.id === 'braavos')

          try {
            await wallet.request({
              type: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  address: tokenAddress
                }
              }
            })
          } catch (error) {
            console.log(error)
          }
        }
      }
    },
    [connector]
  )
}

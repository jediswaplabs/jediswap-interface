import { useCallback } from 'react'
import { useAccountDetails } from '.'

export function useAddTokenToWallet(): (tokenAddress: string) => void {
  const { connector } = useAccountDetails()
  const connectorType = connector?.id()
  return useCallback(
    async (tokenAddress: string) => {
      if (connector) {
        console.log("🚀 ~ file: useAddTokenToWallet.tsx:11 ~ connector:", connector)
        if (connectorType === 'argentX') {
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
        } else if (connectorType === 'braavos') {
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

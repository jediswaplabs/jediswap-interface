import { AbstractConnector } from '@web3-starknet-react/abstract-connector'
import { ArgentXConnector } from '@web3-starknet-react/argentx-connector'
import React, { useCallback } from 'react'
import { useActiveStarknetReact } from '.'

export function useAddTokenToWallet(): (tokenAddress: string) => void {
  const { connector } = useActiveStarknetReact()
  return useCallback(
    async (tokenAddress: string) => {
      if (connector && connector instanceof ArgentXConnector) {
        try {
          await connector.starknet?.request({
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
    },
    [connector]
  )
}

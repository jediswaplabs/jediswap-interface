import { AbstractConnector } from '@web3-starknet-react/abstract-connector'
import { ArgentXConnector } from '@web3-starknet-react/argentx-connector'
import React, { useCallback } from 'react'

export function useAddTokenToWallet(connector: AbstractConnector | undefined): (tokenAddress: string) => void {
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

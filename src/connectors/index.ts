import { ChainId } from '@jediswap/sdk'
import { ArgentXConnector } from '@web3-starknet-react/argentx-connector'
import { BraavosConnector } from '@web3-starknet-react/braavos-connector'

export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? '5')

export const isTestnetEnvironment = () => {
  if (!location) {
    return false
  }
  if (String(location) === '//') {
    return false
  }
  const host = new URL(String(location))?.host || ''
  return host === 'app.testnet.jediswap.xyz'
}

export const isProductionEnvironment = () => {
  if (!location) {
    return false
  }
  if (String(location) === '//') {
    return false
  }
  const host = new URL(String(location))?.host || ''
  return host === 'app.jediswap.xyz'
}

// Starknet
export const argentX = new ArgentXConnector({
  supportedChainIds: [
    ...(isProductionEnvironment() ? [] : [ChainId.GÖRLI]),
    ...(isTestnetEnvironment() ? [] : [ChainId.MAINNET])
  ]
})

export const braavosWallet = new BraavosConnector({
  supportedChainIds: [
    ...(isProductionEnvironment() ? [] : [ChainId.GÖRLI]),
    ...(isTestnetEnvironment() ? [] : [ChainId.MAINNET])
  ]
})

export type injectedConnector = 'argentx' | 'braavos'

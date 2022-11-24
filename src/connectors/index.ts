import { ChainId } from '@jediswap/sdk'
import { ArgentXConnector } from '@web3-starknet-react/argentx-connector'
import { BraavosConnector } from '@web3-starknet-react/braavos-connector'

export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? '5')

const isTestnetHost = () => {
  const host = (new URL(String(location)))?.host || '';
  return host === 'app.testnet.jediswap.xyz';
}

// Starknet
export const argentX = new ArgentXConnector({ supportedChainIds: [ChainId.GÖRLI, ...(isTestnetHost() ? [] : [ChainId.MAINNET])] })

export const braavosWallet = new BraavosConnector({ supportedChainIds: [ChainId.GÖRLI, ...(isTestnetHost() ? [] : [ChainId.MAINNET])] })

export type injectedConnector = 'argentx' | 'braavos'

import { ChainId } from '@jediswap/sdk'
import { ArgentXConnector } from '@web3-starknet-react/argentx-connector'

export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? '5')

// export const injected = new InjectedConnector({
//   supportedChainIds: [1, 3, 4, 5, 42]
// })

// Starknet
export const argentX = new ArgentXConnector({ supportedChainIds: [ChainId.GÖRLI] })

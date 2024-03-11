import { ChainId } from '@jediswap/sdk'
import { jsonRpcProvider } from '@starknet-react/core'
import { RpcProvider } from 'starknet'
import { isProductionEnvironment } from '../connectors'

interface NetworkTypes {
  [key: string]: string
}

const networks: NetworkTypes = {
  Starknet: 'mainnet',
  'Starknet Goerli Testnet': 'goerli',
  'Starknet Sepolia Testnet': 'sepolia'
}

const provider = jsonRpcProvider({
  rpc: chain => {
    const chainType: string = networks[chain.name]

    let nodeUrl = 'https://rpc.starknet-testnet.lava.build/'
    if (chainType === 'sepolia') {
      nodeUrl = 'https://starknet-sepolia.public.blastapi.io'
    } else if (chainType === 'mainnet') {
      nodeUrl = isProductionEnvironment()
        ? 'https://api-starknet-jediswap.dwellir.com'
        : 'https://api-starknet-mainnet-tmp.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c'
    } else if (chainType === 'goerli') {
      nodeUrl = 'https://rpc.starknet-testnet.lava.build/'
    }

    return {
      nodeUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
})

export const providerInstance = (chainId: string) => {
  return new RpcProvider({
    nodeUrl:
      chainId === ChainId.SN_GOERLI
        ? 'https://starknet-testnet.public.blastapi.io/rpc/v0_6'
        : isProductionEnvironment()
        ? 'https://api-starknet-jediswap.dwellir.com'
        : 'https://api-starknet-mainnet-tmp.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c'
  })
}

export default provider

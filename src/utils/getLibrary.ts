import { jsonRpcProvider } from '@starknet-react/core'
import { Chain } from '@starknet-react/chains'

function rpc(chain: Chain) {
  return {
    http: 'https://starknet-mainnet-rpc.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c'
  }
}

const provider = jsonRpcProvider({ rpc })

export default provider

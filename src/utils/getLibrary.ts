import { RpcProvider } from 'starknet'

export default function RPCProvider(): RpcProvider {
  const library = new RpcProvider({
    nodeUrl: 'https://starknet-mainnet-rpc.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c'
  })
  // library.pollingInterval = 15000
  return library
}

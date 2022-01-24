// import { Web3Provider } from '@ethersproject/providers'
import { Provider } from '@jediswap/starknet'

export default function getLibrary(provider: any): Provider {
  const library = new Provider(provider)
  console.log('🚀 ~ file: getLibrary.ts ~ line 5 ~ getLibrary ~ library', library)
  // library.pollingInterval = 15000
  return library
}

import { Provider } from 'starknet'

export default function getLibrary(provider: any): Provider {
  const library = new Provider(provider)

  // library.pollingInterval = 15000
  return library
}

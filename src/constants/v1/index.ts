import { Interface } from '@ethersproject/abi'
import V1_EXCHANGE_ABI from './v1_exchange.json'
import V1_FACTORY_ABI from './v1_factory.json'
import { ChainId } from '@jediswap/sdk'

const V1_FACTORY_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.SN_MAIN]: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',
  [ChainId.SN_GOERLI]: '0x6Ce570d02D73d4c384b46135E87f8C592A8c86dA'
}

const V1_FACTORY_INTERFACE = new Interface(V1_FACTORY_ABI)
const V1_EXCHANGE_INTERFACE = new Interface(V1_EXCHANGE_ABI)

export { V1_FACTORY_ADDRESSES, V1_FACTORY_INTERFACE, V1_FACTORY_ABI, V1_EXCHANGE_INTERFACE, V1_EXCHANGE_ABI }

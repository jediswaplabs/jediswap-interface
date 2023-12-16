import { ChainId } from '@jediswap/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.SN_MAIN]: '0x477dde12a2737a67d2c3c6820a48ae5ed2cf7257c8c44a61e39d1c118e6f468',
  [ChainId.SN_GOERLI]: '0x407308c3cb942e773eef857d42db72f4148e4904bdf92acf8a417532c5bd53a'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }

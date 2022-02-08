import { ChainId } from '@jediswap/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x536ff7fdf6f4de3caf7bbf85a0ee7f3487d7b05cae1849dd38ffb38abf77381',
  [ChainId.ROPSTEN]: '0x536ff7fdf6f4de3caf7bbf85a0ee7f3487d7b05cae1849dd38ffb38abf77381',
  [ChainId.KOVAN]: '0x536ff7fdf6f4de3caf7bbf85a0ee7f3487d7b05cae1849dd38ffb38abf77381',
  [ChainId.RINKEBY]: '0x536ff7fdf6f4de3caf7bbf85a0ee7f3487d7b05cae1849dd38ffb38abf77381',
  [ChainId.GÖRLI]: '0x536ff7fdf6f4de3caf7bbf85a0ee7f3487d7b05cae1849dd38ffb38abf77381'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }

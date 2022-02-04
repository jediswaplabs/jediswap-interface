import { ChainId } from '@jediswap/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x068d6f9739cf36d07a495069257b25d9cc44342a9bcb216cd6438db552ad3adb',
  [ChainId.ROPSTEN]: '0x068d6f9739cf36d07a495069257b25d9cc44342a9bcb216cd6438db552ad3adb',
  [ChainId.KOVAN]: '0x068d6f9739cf36d07a495069257b25d9cc44342a9bcb216cd6438db552ad3adb',
  [ChainId.RINKEBY]: '0x068d6f9739cf36d07a495069257b25d9cc44342a9bcb216cd6438db552ad3adb',
  [ChainId.GÖRLI]: '0x068d6f9739cf36d07a495069257b25d9cc44342a9bcb216cd6438db552ad3adb'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }

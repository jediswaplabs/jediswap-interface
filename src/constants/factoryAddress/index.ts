import { ChainId } from '@jediswap/sdk'
import FACTORY_ABI from './abi.json'

//change ABI and Contracts

const FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x06c872d0696e7bf45735239393774f51455e3bdb08760a0dc76cd7c8688cfd60',
  [ChainId.ROPSTEN]: '0x06c872d0696e7bf45735239393774f51455e3bdb08760a0dc76cd7c8688cfd60',
  [ChainId.KOVAN]: '0x06c872d0696e7bf45735239393774f51455e3bdb08760a0dc76cd7c8688cfd60',
  [ChainId.RINKEBY]: '0x06c872d0696e7bf45735239393774f51455e3bdb08760a0dc76cd7c8688cfd60',
  [ChainId.GÖRLI]: '0x06c872d0696e7bf45735239393774f51455e3bdb08760a0dc76cd7c8688cfd60'
}

export { FACTORY_ABI, FACTORY_ADDRESS }

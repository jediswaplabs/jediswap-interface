import { ChainId } from '@jediswap/sdk'
import ZAP_IN_ABI from './abi.json'

//Change ABI
//Change Addressses

const ZAP_IN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x07e4a2e2ad496c7572228d922a50e656b5791a6f09818fb709e697f460f55735',
  [ChainId.ROPSTEN]: '0x73e3ccd627283aed4fa3940aa2bdb4d2c702e8e44c99b6851c019222558310f',
  [ChainId.KOVAN]: '0x73e3ccd627283aed4fa3940aa2bdb4d2c702e8e44c99b6851c019222558310f',
  [ChainId.RINKEBY]: '0x73e3ccd627283aed4fa3940aa2bdb4d2c702e8e44c99b6851c019222558310f',
  [ChainId.GÖRLI]: '0x73e3ccd627283aed4fa3940aa2bdb4d2c702e8e44c99b6851c019222558310f'
}

export { ZAP_IN_ABI, ZAP_IN_ADDRESS }

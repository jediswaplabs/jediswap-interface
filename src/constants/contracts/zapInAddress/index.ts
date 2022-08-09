import { ChainId } from '@jediswap/sdk'
import ZAP_IN_ABI from './abi.json'

//Change ABI
//Change Addressses

const ZAP_IN_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x07e4a2e2ad496c7572228d922a50e656b5791a6f09818fb709e697f460f55735',
  [ChainId.ROPSTEN]: '0x07e4a2e2ad496c7572228d922a50e656b5791a6f09818fb709e697f460f55735',
  [ChainId.KOVAN]: '0x07e4a2e2ad496c7572228d922a50e656b5791a6f09818fb709e697f460f55735',
  [ChainId.RINKEBY]: '0x07e4a2e2ad496c7572228d922a50e656b5791a6f09818fb709e697f460f55735',
  [ChainId.GÖRLI]: '0x07e4a2e2ad496c7572228d922a50e656b5791a6f09818fb709e697f460f55735'
}

export { ZAP_IN_ABI, ZAP_IN_ADDRESS }

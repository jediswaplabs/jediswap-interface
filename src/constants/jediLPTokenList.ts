import { WBTC, DAI, USDC } from './jediTokens'
import { ChainId, LPToken } from '@jediswap/sdk'

export const jediPairAddresses = {
  ETH_WBTC: '0x1ee200135992a79412a76ae7b6fd3c6e1dfda027149423de188db8218ec06ca',
  ETH_DAI: '0x353b5bf1976a113aff6840d5f159310e197105a6a934a1df044e126d052e51f',
  ETH_USDC: '0x4323e912f2774814f4f3c17c2359963291c9e56a20b60569cdf91e34dcf0da0',
  WBTC_USDC: '0x6adfff3140f4d687c4d1226bc2f6bdfd4705ab69c424240dd6a1a113f43a604',
  DAI_USDC: '0x661c12c1a5f0997b11cbc868d44b78d3ad7eb41a232f7bb39b574b5631387a0'
}

export const LP_ETH_WBTC = new LPToken(ChainId.GÖRLI, WBTC, DAI, jediPairAddresses.ETH_WBTC)

export const LP_ETH_DAI = new LPToken(ChainId.GÖRLI, WBTC, DAI, jediPairAddresses.ETH_DAI)

export const LP_ETH_USDC = new LPToken(ChainId.GÖRLI, WBTC, USDC, jediPairAddresses.ETH_USDC)

export const LP_WBTC_USDC = new LPToken(ChainId.GÖRLI, WBTC, USDC, jediPairAddresses.WBTC_USDC)

export const LP_DAI_USDC = new LPToken(ChainId.GÖRLI, DAI, USDC, jediPairAddresses.DAI_USDC)

export const jediLPTokenList = {
  [LP_ETH_WBTC.address]: LP_ETH_WBTC,
  [LP_ETH_DAI.address]: LP_ETH_DAI,
  [LP_ETH_USDC.address]: LP_ETH_USDC,
  [LP_WBTC_USDC.address]: LP_WBTC_USDC,
  [LP_DAI_USDC.address]: LP_DAI_USDC
}

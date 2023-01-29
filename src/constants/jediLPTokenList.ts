import { WBTC, DAI, USDC } from './jediTokens'
import { ChainId, LPToken } from '@jediswap/sdk'

export const jediPairAddresses = {
  ETH_WBTC: '0x699b290b25c03cedf6a29e767b40420b572bee5296dd284b34304dfdf52f847',
  ETH_DAI: '0x78cf9537391591ebb9700d11f0980e05a6cf5fffc50fd31e433377f59ad840f',
  ETH_USDC: '0x30da33d4e75cd9dd614c76a50706a0a853c86b7ad145c2efb8855a04394a853',
  WBTC_USDC: '0x14e0c32a4d419cbe90ff51ab5418fd75e1f0c62d5b4c77473a4de594e88922c',
  DAI_USDC: '0x195d8a828e538d9a2f53126b8c162ed707d0fe8dab8888497fefef4615f9ffe'
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

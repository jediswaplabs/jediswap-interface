import { WETH } from '@jediswap/sdk'
import { DAI_GOERLI, USDC_GOERLI } from '.'
import { ChainId, LPToken } from '@jediswap/sdk'

export const jediPairAddresses = {
  TOKEN0_TOKEN1: '0x4b05cce270364e2e4bf65bde3e9429b50c97ea3443b133442f838045f41e733',
  TOKEN0_TOKEN2: '0x682bde101e0fa17bb61d867a14db62ddd192d35cc4ad2109e91429e2e4fca17',
  TOKEN0_TOKEN3: '0x13386f165f065115c1da38d755be261023c32f0134a03a8e66b6bb1e0016014',
  TOKEN1_TOKEN3: '0x20d17664962dc4b49ab65b4b89555f383f040da5f62c18a0834acea246bc7b7',
  TOKEN2_TOKEN3: '0x12e39cd6c851d970fd74662cac9ae459934bbfb8334f1c78195cf63e9b1ea5c'
}

export const WETH_GORLI = WETH[ChainId.GÖRLI]

export const LP_T0_T1 = new LPToken(ChainId.GÖRLI, WETH_GORLI, DAI_GOERLI, jediPairAddresses.TOKEN0_TOKEN1)

export const LP_T0_T2 = new LPToken(ChainId.GÖRLI, WETH_GORLI, USDC_GOERLI, jediPairAddresses.TOKEN0_TOKEN2)

// export const LP_T0_T3 = new LPToken(ChainId.GÖRLI, WETH_GORLI, TOKEN3, jediPairAddresses.TOKEN0_TOKEN3)

// export const LP_T1_T3 = new LPToken(ChainId.GÖRLI, TOKEN1, TOKEN3, jediPairAddresses.TOKEN1_TOKEN3)

// export const LP_T2_T3 = new LPToken(ChainId.GÖRLI, TOKEN2, TOKEN3, jediPairAddresses.TOKEN2_TOKEN3)

export const jediLPTokenList = {
  [LP_T0_T1.address]: LP_T0_T1,
  [LP_T0_T2.address]: LP_T0_T2
  // [LP_T0_T3.address]: LP_T0_T3,
  // [LP_T1_T3.address]: LP_T1_T3,
  // [LP_T2_T3.address]: LP_T2_T3
}

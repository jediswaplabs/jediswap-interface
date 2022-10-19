import { WETH } from '@jediswap/sdk'
import { DAI, USDC } from '.'
import { ChainId, LPToken } from '@jediswap/sdk'

export const jediPairAddresses = {
  [ChainId.GÖRLI]: {
    TOKEN0_TOKEN1: '0x4b05cce270364e2e4bf65bde3e9429b50c97ea3443b133442f838045f41e733',
    TOKEN0_TOKEN2: '0x682bde101e0fa17bb61d867a14db62ddd192d35cc4ad2109e91429e2e4fca17',
    TOKEN0_TOKEN3: '0x13386f165f065115c1da38d755be261023c32f0134a03a8e66b6bb1e0016014',
    TOKEN1_TOKEN3: '0x20d17664962dc4b49ab65b4b89555f383f040da5f62c18a0834acea246bc7b7',
    TOKEN2_TOKEN3: '0x12e39cd6c851d970fd74662cac9ae459934bbfb8334f1c78195cf63e9b1ea5c'
  },
  [ChainId.MAINNET]: {
    TOKEN0_TOKEN1: '0x4b05cce270364e2e4bf65bde3e9429b50c97ea3443b133442f838045f41e733',
    TOKEN0_TOKEN2: '0x682bde101e0fa17bb61d867a14db62ddd192d35cc4ad2109e91429e2e4fca17',
    TOKEN0_TOKEN3: '0x13386f165f065115c1da38d755be261023c32f0134a03a8e66b6bb1e0016014',
    TOKEN1_TOKEN3: '0x20d17664962dc4b49ab65b4b89555f383f040da5f62c18a0834acea246bc7b7',
    TOKEN2_TOKEN3: '0x12e39cd6c851d970fd74662cac9ae459934bbfb8334f1c78195cf63e9b1ea5c'
  },
}

export const LP_T0_T1 = {
  [ChainId.GÖRLI]: new LPToken(ChainId.GÖRLI, WETH[ChainId.GÖRLI], DAI[ChainId.GÖRLI], jediPairAddresses[ChainId.GÖRLI].TOKEN0_TOKEN1),
  [ChainId.MAINNET]: new LPToken(ChainId.MAINNET, WETH[ChainId.MAINNET], DAI[ChainId.MAINNET], jediPairAddresses[ChainId.MAINNET].TOKEN0_TOKEN1)
}

export const LP_T0_T2 = {
  [ChainId.GÖRLI]: new LPToken(ChainId.GÖRLI, WETH[ChainId.GÖRLI], USDC[ChainId.GÖRLI], jediPairAddresses[ChainId.GÖRLI].TOKEN0_TOKEN2),
  [ChainId.MAINNET]: new LPToken(ChainId.MAINNET, WETH[ChainId.MAINNET], USDC[ChainId.MAINNET], jediPairAddresses[ChainId.MAINNET].TOKEN0_TOKEN2)
}

export const jediLPTokenList = {
  [ChainId.GÖRLI]: {
    [LP_T0_T1[ChainId.GÖRLI].address]: LP_T0_T1[ChainId.GÖRLI],
    [LP_T0_T2[ChainId.GÖRLI].address]: LP_T0_T2[ChainId.GÖRLI]
  },
  [ChainId.MAINNET]: {
    [LP_T0_T1[ChainId.MAINNET].address]: LP_T0_T1[ChainId.MAINNET],
    [LP_T0_T2[ChainId.MAINNET].address]: LP_T0_T2[ChainId.MAINNET]
  },
}

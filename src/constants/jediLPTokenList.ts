import { TOKEN0, TOKEN1, TOKEN2 } from './jediTokens'
import { ChainId, LPToken } from '@jediswap/sdk'

export const jediPairAddresses = {
  TOKEN0_TOKEN1: '0x3c2c913814a594de73f60277baf03ddafcaa30c4a6ad515bea7f513d6c19aad',
  TOKEN0_TOKEN2: '0x33d673dd99c92ed2de27ded76eb406be91cd55f72cdf4ec253b75dcef21782e'
}

export const LP_T0_T1 = new LPToken(ChainId.GÖRLI, TOKEN0, TOKEN1, jediPairAddresses.TOKEN0_TOKEN1)

export const LP_T0_T2 = new LPToken(ChainId.GÖRLI, TOKEN0, TOKEN2, jediPairAddresses.TOKEN0_TOKEN2)

export const jediLPTokenList = {
  [LP_T0_T1.address]: LP_T0_T1,
  [LP_T0_T2.address]: LP_T0_T2
}

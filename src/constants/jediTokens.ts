import { ChainId, Token } from '@jediswap/sdk'
import { validateAndParseAddress } from '@jediswap/starknet'

// JEDI TOKENS
export const TOKEN0_ADDRESS = validateAndParseAddress(
  '0x4bc8ac16658025bff4a3bd0760e84fcf075417a4c55c6fae716efdd8f1ed26c'
)
export const TOKEN1_ADDRESS = validateAndParseAddress(
  '0x5f405f9650c7ef663c87352d280f8d359ad07d200c0e5450cb9d222092dc756'
)
export const TOKEN2_ADDRESS = validateAndParseAddress(
  '0x24da028e8176afd3219fbeafb17c49624af9b86dcbe81007ae40d93f741617d'
)

export const TOKEN3_ADDRESS = validateAndParseAddress(
  '0x1ca5dedf1612b1ffb035e838ac09d70e500d22cf9cd0de4bebcef8553506fdb'
)

export const TOKEN0 = new Token(ChainId.GÖRLI, TOKEN0_ADDRESS, 18, 'J23FEB0', 'Jedi23Feb 0 ')

export const TOKEN1 = new Token(ChainId.GÖRLI, TOKEN1_ADDRESS, 6, 'J23FEB1', 'Jedi23Feb 1')

export const TOKEN2 = new Token(ChainId.GÖRLI, TOKEN2_ADDRESS, 18, 'J23FEB2', 'Jedi23Feb 2')

export const TOKEN3 = new Token(ChainId.GÖRLI, TOKEN3_ADDRESS, 18, 'J23FEB3', 'Jedi23Feb 3')

// STABLE JEDI TOKENS
// export const STABLE_TOKEN0_ADDRESS = validateAndParseAddress(
//   '0x50f1585a9212f9ac8e8a23366aedbe5a2dea871daf8e6775941ebfa24f35830'
// )
// export const STABLE_TOKEN1_ADDRESS = validateAndParseAddress(
//   '0x1d673dfda7eaedb1b9fd7d76e53d9b563735c361e0a4eb4505c8c8652b6c972'
// )

// export const STABLE_TOKEN2_ADDRESS = validateAndParseAddress(
//   '0x116738e689ae8ba905fbf8867266d38db58221e05d663c82b0d95ff4a85996f'
// )

// export const STABLE_TOKEN0 = new Token(ChainId.GÖRLI, STABLE_TOKEN0_ADDRESS, 18, 'SJ4FEB0', 'SJedi4Feb 0')
// export const STABLE_TOKEN1 = new Token(ChainId.GÖRLI, STABLE_TOKEN1_ADDRESS, 18, 'SJ4FEB1', 'SJedi4Feb 1')
// export const STABLE_TOKEN2 = new Token(ChainId.GÖRLI, STABLE_TOKEN2_ADDRESS, 18, 'SJ4FEB2', 'SJedi4Feb 2')

export const jediTokensList = {
  //   [TOKEN0_ADDRESS]: TOKEN0,
  [TOKEN1_ADDRESS]: TOKEN1,
  [TOKEN2_ADDRESS]: TOKEN2,
  [TOKEN3_ADDRESS]: TOKEN3

  // Stables
  // [STABLE_TOKEN0_ADDRESS]: STABLE_TOKEN0,
  // [STABLE_TOKEN1_ADDRESS]: STABLE_TOKEN1,
  // [STABLE_TOKEN2_ADDRESS]: STABLE_TOKEN2
}

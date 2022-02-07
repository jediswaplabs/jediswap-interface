import { ChainId, Token } from '@jediswap/sdk'
import { validateAndParseAddress } from '@jediswap/starknet'

// JEDI TOKENS
export const TOKEN0_ADDRESS = validateAndParseAddress(
  '0x51ecf6b7831cd141391313ce417f5f50e2a2cadba553562064bcd0e78eed8d7'
)
export const TOKEN1_ADDRESS = validateAndParseAddress(
  '0x1f7b127a0870766c6651875b2a58cd39d57a99ac8cb34064523affd955c1e2'
)
export const TOKEN2_ADDRESS = validateAndParseAddress(
  '0x30d1dc0202e2b5820d2956bc6232f3f76eb32b397f3242b63f5780d00acdeec'
)

export const TOKEN0 = new Token(ChainId.GÖRLI, TOKEN0_ADDRESS, 18, 'J4FEB0', 'Jedi4Feb 0')

export const TOKEN1 = new Token(ChainId.GÖRLI, TOKEN1_ADDRESS, 18, 'J4FEB1', 'Jedi4Feb 1')

export const TOKEN2 = new Token(ChainId.GÖRLI, TOKEN2_ADDRESS, 18, 'J4FEB2', 'Jedi4Feb 2')

// STABLE JEDI TOKENS
export const STABLE_TOKEN0_ADDRESS = validateAndParseAddress(
  '0x50f1585a9212f9ac8e8a23366aedbe5a2dea871daf8e6775941ebfa24f35830'
)
export const STABLE_TOKEN1_ADDRESS = validateAndParseAddress(
  '0x1d673dfda7eaedb1b9fd7d76e53d9b563735c361e0a4eb4505c8c8652b6c972'
)

export const STABLE_TOKEN2_ADDRESS = validateAndParseAddress(
  '0x116738e689ae8ba905fbf8867266d38db58221e05d663c82b0d95ff4a85996f'
)

export const STABLE_TOKEN0 = new Token(ChainId.GÖRLI, STABLE_TOKEN0_ADDRESS, 18, 'SJ4FEB0', 'SJedi4Feb 0')
export const STABLE_TOKEN1 = new Token(ChainId.GÖRLI, STABLE_TOKEN1_ADDRESS, 18, 'SJ4FEB1', 'SJedi4Feb 1')
export const STABLE_TOKEN2 = new Token(ChainId.GÖRLI, STABLE_TOKEN2_ADDRESS, 18, 'SJ4FEB2', 'SJedi4Feb 2')

export const jediTokensList = {
  //   [TOKEN0_ADDRESS]: TOKEN0,
  [TOKEN1_ADDRESS]: TOKEN1,
  [TOKEN2_ADDRESS]: TOKEN2

  // Stables
  // [STABLE_TOKEN0_ADDRESS]: STABLE_TOKEN0,
  // [STABLE_TOKEN1_ADDRESS]: STABLE_TOKEN1,
  // [STABLE_TOKEN2_ADDRESS]: STABLE_TOKEN2
}

// import { BigNumberish } from 'starknet/dist/utils/number'
import { validateAndParseAddress, Abi, uint256, Contract, AccountInterface, BigNumberish, cairo } from 'starknet'
import { BigNumber } from '@ethersproject/bignumber'
import { ZERO_ADDRESS } from '../constants'
import { JSBI, Percent, Token, CurrencyAmount, Currency, ETHER } from '@jediswap/sdk'
import { LPTokenAddressMap, TokenAddressMap } from '../state/lists/hooks'
import isZero from './isZero'
import { Connector, useProvider } from '@starknet-react/core'
import { ChainId } from '@jediswap/sdk'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(addr: string | null | undefined): string | false {
  try {
    if (addr && !isZero(addr)) {
      return validateAndParseAddress(addr)
    }
    return false
  } catch {
    return false
  }
}

const VOYAGER_PREFIXES: { [chainId in ChainId]: string } = {
  [ChainId.SN_MAIN]: '',
  [ChainId.SN_GOERLI]: 'sepolia.'
}

const STARKSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  [ChainId.SN_MAIN]: '',
  [ChainId.SN_GOERLI]: 'testnet.'
}

export function getVoyagerLink(chainId: ChainId, data: string, type: 'transaction' | 'block' | 'contract'): string {
  const prefix = `https://${VOYAGER_PREFIXES[chainId] || VOYAGER_PREFIXES[1]}voyager.online`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'contract':
    default: {
      return `${prefix}/contract/${data}`
    }
  }
}

export function getStarkscanLink(chainId: ChainId, data: string, type: 'transaction' | 'block' | 'contract'): string {
  const prefix = `https://${STARKSCAN_PREFIXES[chainId] || STARKSCAN_PREFIXES['0x534e5f4d41494e']}starkscan.co`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'contract':
    default: {
      return `${prefix}/contract/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(63 - chars)}`
}

export function shortenStarkID(starkID: string): string {
  if (!starkID?.length) {
    return ''
  }
  if (starkID.length <= 21) {
    return starkID
  }
  return `${starkID.substring(0, 6)}...${starkID.substring(starkID.length - 12)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is optional
// export function getProviderOrSigner(
//   library: Provider,
//   connector?: AbstractConnector,
//   account?: string
// ): Provider | SignerInterface | undefined {
//   return account && connector ? connector.getSigner() : library
// }

// account is optional
export function getContract(address: string, ABI: any, account: any): Contract {
  const parsedAddress = isAddress(address)
  if (!parsedAddress || parsedAddress === ZERO_ADDRESS) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return new Contract(ABI as Abi, address, account)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap | LPTokenAddressMap, currency?: Currency): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export const parsedAmountToUint256Args = (amount: JSBI): { [k: string]: BigNumberish; type: 'struct' } => {
  return { type: 'struct', ...cairo.uint256(amount.toString()) }
}

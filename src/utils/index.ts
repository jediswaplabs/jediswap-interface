import { BigNumberish } from 'starknet/dist/utils/number'
import { AbstractConnector } from '@web3-starknet-react/abstract-connector'
import { useMemo } from 'react'
// import { Contract } from '@ethersproject/contracts'
import { Abi, Contract, Provider, Signer, SignerInterface, uint256 } from 'starknet'
import { BigNumber } from '@ethersproject/bignumber'
import { ZERO_ADDRESS } from '../constants'
import { ChainId, JSBI, Percent, Token, CurrencyAmount, Currency, ETHER } from '@jediswap/sdk'
import { LPTokenAddressMap, TokenAddressMap } from '../state/lists/hooks'
import { getChecksumAddress } from 'starknet'
import isZero from './isZero'
import { wrappedCurrency } from './wrappedCurrency'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(addr: string | null | undefined): string | false {
  try {
    if (addr && !isZero(addr)) {
      const starknetAddress = getChecksumAddress(addr)
      return starknetAddress
    }
    return false
  } catch {
    return false
  }
}

const VOYAGER_PREFIXES: { [chainId in ChainId]: string } = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.'
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

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(63 - chars)}`
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
export function getContract(
  address: string,
  ABI: any,
  library: Provider,
  connector?: AbstractConnector,
  account?: string
): Contract {
  const parsedAddress = isAddress(address)

  if (!parsedAddress || parsedAddress === ZERO_ADDRESS) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  // const providerOrSigner = getProviderOrSigner(library, connector, account)

  return new Contract(ABI as Abi, address)
}

// account is optional
// export function getRouterContract(_: number, library: any, account?: string): Contract {
//   return getContract(ROUTER_ADDRESS, JediSwapRouterABI, library, account)
// }

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(
  defaultTokens: TokenAddressMap | LPTokenAddressMap,
  currency?: Currency,
  chainId?: ChainId
): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export const parsedAmountToUint256Args = (amount: JSBI): { [k: string]: BigNumberish; type: 'struct' } => {
  return { type: 'struct', ...uint256.bnToUint256(amount.toString()) }
}

import { AbstractConnector } from '@web3-starknet-react/abstract-connector'
import { useMemo } from 'react'
// import { Contract } from '@ethersproject/contracts'
import { Abi, Contract, Provider, Signer, SignerInterface } from 'starknet'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { TOKEN1 } from '../constants'
import { ChainId, JSBI, Percent, Token, CurrencyAmount, Currency, TOKEN0 } from '@jediswap/sdk'
import { TokenAddressMap } from '../state/lists/hooks'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(addr: any): string | false {
  try {
    if (typeof addr === 'string' && addr.match(/^(0x)?[0-9a-fA-F]{63}$/)) {
      const address = addr.substring(0, 2) === '0x' ? addr : `0x${addr}`
      return address
    }
    return false
  } catch {
    return false
  }
}

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.'
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}voyager.online`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
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
export function getProviderOrSigner(
  library: Provider,
  connector?: AbstractConnector,
  account?: string
): Provider | undefined {
  return account && connector ? connector.getSigner() : library
}

// account is optional
export function getContract(
  address: string,
  ABI: any,
  library: Provider,
  connector?: AbstractConnector,
  account?: string
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  console.log('Library: ', library)

  const providerOrSigner = getProviderOrSigner(library, connector, account)

  return new Contract(ABI as Abi[], address, providerOrSigner)
}

// account is optional
// export function getRouterContract(_: number, library: any, account?: string): Contract {
//   return getContract(ROUTER_ADDRESS, JediSwapRouterABI, library, account)
// }

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === TOKEN0 || currency === TOKEN1) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

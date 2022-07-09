import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { TokenAmount, Token, ChainId, Percent, JSBI } from '@jediswap/sdk'

import {
  getVoyagerLink,
  calculateSlippageAmount,
  isAddress,
  shortenAddress,
  calculateGasMargin,
  basisPointsToPercent
} from '.'

describe('utils', () => {
  describe('#getVoyagerLink', () => {
    it('correct for tx', () => {
      expect(getVoyagerLink(1, 'abc', 'transaction')).toEqual('https://voyager.online/tx/abc')
    })
    it('correct for contract', () => {
      expect(getVoyagerLink(1, 'abc', 'contract')).toEqual('https://voyager.online/contract/abc')
    })
    it('correct for block', () => {
      expect(getVoyagerLink(1, 'abc', 'block')).toEqual('https://voyager.online/block/abc')
    })
    it('unrecognized chain id defaults to mainnet', () => {
      expect(getVoyagerLink(2, 'abc', 'contract')).toEqual('https://voyager.online/contract/abc')
    })
    it('ropsten', () => {
      expect(getVoyagerLink(3, 'abc', 'contract')).toEqual('https://ropsten.voyager.online/contract/abc')
    })
    it('enum', () => {
      expect(getVoyagerLink(ChainId.RINKEBY, 'abc', 'contract')).toEqual('https://rinkeby.voyager.online/contract/abc')
    })
  })

  describe('#calculateSlippageAmount', () => {
    it('bounds are correct', () => {
      const tokenAmount = new TokenAmount(new Token(ChainId.MAINNET, AddressZero, 0), '100')
      expect(() => calculateSlippageAmount(tokenAmount, -1)).toThrow()
      expect(calculateSlippageAmount(tokenAmount, 0).map(bound => bound.toString())).toEqual(['100', '100'])
      expect(calculateSlippageAmount(tokenAmount, 100).map(bound => bound.toString())).toEqual(['99', '101'])
      expect(calculateSlippageAmount(tokenAmount, 200).map(bound => bound.toString())).toEqual(['98', '102'])
      expect(calculateSlippageAmount(tokenAmount, 10000).map(bound => bound.toString())).toEqual(['0', '200'])
      expect(() => calculateSlippageAmount(tokenAmount, 10001)).toThrow()
    })
  })

  describe('#isAddress', () => {
    it('returns false if not', () => {
      expect(isAddress('')).toBe(false)
      expect(isAddress('0x0000')).toBe(false)
      expect(isAddress(undefined)).toBe(false)
    })

    it('returns the checksummed address', () => {
      expect(isAddress('0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9')).toBe(
        '0x03e85bfBB8E2a42b7beaD9e88E9A1B19DbCCf661471061807292120462396ec9'
      )
    })

    it('fails if too long', () => {
      expect(isAddress('f164fc0ec4e93095b804a4795bbe1e041497b92a0')).toBe(false)
    })
  })

  describe('#shortenAddress', () => {
    it('throws on invalid address', () => {
      expect(() => shortenAddress('abc')).toThrow("Invalid 'address'")
    })

    it('truncates middle characters', () => {
      expect(shortenAddress('0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9')).toBe(
        '0x03e8...2396ec9'
      )
    })

    it('renders checksummed address', () => {
      expect(shortenAddress('0x4b05cce270364e2e4bf65bde3e9429b50c97ea3443b133442f838045f41e733'.toLowerCase())).toBe(
        '0x04B0...F41E733'
      )
    })
  })

  describe('#calculateGasMargin', () => {
    it('adds 10%', () => {
      expect(calculateGasMargin(BigNumber.from(1000)).toString()).toEqual('1100')
      expect(calculateGasMargin(BigNumber.from(50)).toString()).toEqual('55')
    })
  })

  describe('#basisPointsToPercent', () => {
    it('converts basis points numbers to percents', () => {
      expect(basisPointsToPercent(100).equalTo(new Percent(JSBI.BigInt(1), JSBI.BigInt(100)))).toBeTruthy()
      expect(basisPointsToPercent(500).equalTo(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toBeTruthy()
      expect(basisPointsToPercent(50).equalTo(new Percent(JSBI.BigInt(5), JSBI.BigInt(1000)))).toBeTruthy()
    })
  })
})

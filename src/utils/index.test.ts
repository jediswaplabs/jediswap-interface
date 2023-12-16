import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { TokenAmount, Token, Percent, JSBI } from '@jediswap/sdk'

import {
  getVoyagerLink,
  getStarkscanLink,
  calculateSlippageAmount,
  isAddress,
  shortenAddress,
  calculateGasMargin,
  basisPointsToPercent
} from '.'
import { ChainId } from '@jediswap/sdk'

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
      expect(getVoyagerLink(ChainId.SN_GOERLI, 'abc', 'contract')).toEqual(
        'https://rinkeby.voyager.online/contract/abc'
      )
    })
  })

  describe('#getStarkscanLink', () => {
    it('correct for tx', () => {
      expect(getStarkscanLink(1, 'abc', 'transaction')).toEqual('https://starkscan.co/tx/abc')
    })
    it('correct for contract', () => {
      expect(getStarkscanLink(1, 'abc', 'contract')).toEqual('https://starkscan.co/contract/abc')
    })
    it('correct for block', () => {
      expect(getStarkscanLink(1, 'abc', 'block')).toEqual('https://starkscan.co/block/abc')
    })
    it('unrecognized chain id defaults to mainnet', () => {
      expect(getStarkscanLink(2, 'abc', 'contract')).toEqual('https://starkscan.co/contract/abc')
    })
    it('goerli', () => {
      expect(getStarkscanLink(3, 'abc', 'contract')).toEqual('https://testnet.starkscan.co/contract/abc')
    })
    it('enum', () => {
      expect(getStarkscanLink(ChainId.SN_GOERLI, 'abc', 'contract')).toEqual(
        'https://testnet.starkscan.co/contract/abc'
      )
    })
  })

  describe('#calculateSlippageAmount', () => {
    it('bounds are correct', () => {
      const tokenAmount = new TokenAmount(new Token(ChainId.SN_MAIN, AddressZero, 0), '100')
      expect(() => calculateSlippageAmount(tokenAmount, -1)).toThrow()
      expect(calculateSlippageAmount(tokenAmount, 0).map(bound => bound.toString())).toEqual(['100', '100'])
      expect(calculateSlippageAmount(tokenAmount, 100).map(bound => bound.toString())).toEqual(['99', '101'])
      expect(calculateSlippageAmount(tokenAmount, 200).map(bound => bound.toString())).toEqual(['98', '102'])
      expect(calculateSlippageAmount(tokenAmount, 10000).map(bound => bound.toString())).toEqual(['0', '200'])
      expect(() => calculateSlippageAmount(tokenAmount, 10001)).toThrow()
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

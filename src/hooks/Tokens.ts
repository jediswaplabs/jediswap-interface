import { TOKEN1, TOKEN2 } from './../constants/index'
import { Args, shortString, number as starkNumber } from '@jediswap/starknet'
import { parseBytes32String } from '@ethersproject/strings'
import { Currency, TOKEN0, Token, currencyEquals } from '@jediswap/sdk'
import { useMemo } from 'react'
import { useSelectedTokenList } from '../state/lists/hooks'
import { useUserAddedTokens } from '../state/user/hooks'
import { isAddress } from '../utils'

import { useActiveStarknetReact } from './index'
import { useTokenContract } from './useContract'
import { useStarknetCall, NEVER_RELOAD } from './useStarknet'
import { useSingleCallResult } from '../state/multicall/hooks'
// import { BigNumberish } from 'starknet/dist/utils/number'

export function useAllTokens(): { [address: string]: Token } {
  const { chainId } = useActiveStarknetReact()
  const userAddedTokens = useUserAddedTokens()

  const jediTokenMap = useMemo(() => {
    return {
      [TOKEN1.address]: TOKEN1,
      [TOKEN2.address]: TOKEN2
    }
  }, [])
  const allTokens = useSelectedTokenList()

  return useMemo(() => {
    if (!chainId) return {}
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token
            return tokenMap
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...allTokens[chainId], ...jediTokenMap }
        )
    )
  }, [chainId, userAddedTokens, allTokens, jediTokenMap])
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency): boolean {
  const userAddedTokens = useUserAddedTokens()
  return !!userAddedTokens.find(token => currencyEquals(currency, token))
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/
function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : bytes32 && BYTES32_REGEX.test(bytes32)
    ? parseBytes32String(bytes32)
    : defaultValue
}

function parseStringFromArgs(data: any, isHexNumber?: boolean): string | undefined {
  if (typeof data === 'string') {
    if (isHexNumber) {
      return starkNumber.hexToDecimalString(data)
    } else if (shortString.isShortString(data)) {
      return shortString.decodeShortString(data)
    }
    return data
  }
  return undefined
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
  const { chainId } = useActiveStarknetReact()
  const tokens = useAllTokens()

  const address = isAddress(tokenAddress)
  const token: Token | undefined = address ? tokens[address] : undefined

  const tokenContract = useTokenContract(address ? address : undefined)

  const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD)

  const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD)

  const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD)

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    if (decimals.loading || symbol.loading || tokenName.loading) return null
    if (decimals.result) {
      const token = new Token(
        chainId,
        address,
        parseInt(decimals.result[0]),
        parseStringFromArgs(symbol.result?.[0]),
        parseStringFromArgs(symbol.result?.[0])
      )
      //
      return token
    }
    return undefined
  }, [address, chainId, decimals, symbol, token, tokenName])
}

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const isTOKEN0 = currencyId?.toUpperCase() === 'TOKEN0'
  // const isTOKEN1 = currencyId === TOKEN1.address
  const token = useToken(isTOKEN0 ? undefined : currencyId)
  return isTOKEN0 ? TOKEN0 : token
}

import { Args } from 'starknet'
import { parseBytes32String } from '@ethersproject/strings'
import { Currency, ETHER, Token, currencyEquals } from '@uniswap/sdk'
import { useMemo } from 'react'
import { useSelectedTokenList } from '../state/lists/hooks'
import { useUserAddedTokens } from '../state/user/hooks'
import { isAddress } from '../utils'

import { useActiveStarknetReact } from './index'
import { useTokenContract } from './useContract'
import { useStarknetCall, NEVER_RELOAD } from './useStarknet'
import { BigNumberish } from 'starknet/dist/utils/number'

export function useAllTokens(): { [address: string]: Token } {
  const { chainId } = useActiveStarknetReact()
  const userAddedTokens = useUserAddedTokens()
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
          { ...allTokens[chainId] }
        )
    )
  }, [chainId, userAddedTokens, allTokens])
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

function parseStringFromArgs(data: any): string | undefined {
  if (typeof data === 'string') {
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

  const tokenContract = useTokenContract(address ? address : undefined, false)
  // const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false)
  const token: Token | undefined = address ? tokens[address] : undefined

  const { name: tokenName } = useStarknetCall(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD)
  // const tokenNameBytes32 = useSingleCallResult(
  //   token ? undefined : tokenContractBytes32,
  //   'name',
  //   undefined,
  //   NEVER_RELOAD
  // )
  const { symbol } = useStarknetCall(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD)

  // const symbolBytes32 = useSingleCallResult(token ? undefined : tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)
  const { decimals } = useStarknetCall(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD)

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    if (!decimals || !symbol) return null
    if (decimals && typeof decimals === 'string') {
      return new Token(
        chainId,
        address,
        parseInt(decimals),
        parseStringFromArgs(symbol),
        parseStringFromArgs(tokenName)
      )
    }
    return undefined
  }, [address, chainId, token])
}

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const isETH = currencyId?.toUpperCase() === 'ETH'
  const token = useToken(isETH ? undefined : currencyId)
  return isETH ? ETHER : token
}

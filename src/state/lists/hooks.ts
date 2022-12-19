import { BASES_TO_BUILD_ZAPPER_LIST_AGAINST } from './../../constants/index'
import { ChainId, LPToken, Pair, Token } from '@jediswap/sdk'
import { Tags, TokenInfo, TokenList } from '@jediswap/token-lists'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../index'
import { useAllPairs } from '../pairs/hooks'

type TagDetails = Tags[keyof Tags]
export interface TagInfo extends TagDetails {
  id: string
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  public readonly tags: TagInfo[]
  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name, tokenInfo.logoURI)
    this.tokenInfo = tokenInfo
    this.tags = tags
  }
}

export class WrappedLPTokenInfo extends LPToken {
  public readonly token0Info: WrappedTokenInfo
  public readonly token1Info: WrappedTokenInfo
  public readonly tags: TagInfo[]

  constructor(chainId: ChainId, token0Info: WrappedTokenInfo, token1Info: WrappedTokenInfo, tags: TagInfo[]) {
    const token0 = new Token(
      token0Info.chainId,
      token0Info.address,
      token0Info.decimals,
      token0Info.symbol,
      token0Info.name,
      token0Info.logoURI
    )
    const token1 = new Token(
      token1Info.chainId,
      token1Info.address,
      token1Info.decimals,
      token1Info.symbol,
      token1Info.name,
      token1Info.logoURI
    )

    super(chainId, token0, token1, Pair.getAddress(token0, token1))

    this.token0Info = token0Info
    this.token1Info = token1Info
    this.tags = tags
  }
}

export type TokenAddressMap = Readonly<{ [chainId in ChainId]: Readonly<{ [tokenAddress: string]: WrappedTokenInfo }> }>

export type LPTokenAddressMap = Readonly<
  { [chainId in ChainId]: Readonly<{ [lpTokenAddress: string]: WrappedLPTokenInfo }> }
>

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.KOVAN]: {},
  [ChainId.RINKEBY]: {},
  [ChainId.ROPSTEN]: {},
  [ChainId.GÖRLI]: {},
  [ChainId.MAINNET]: {}
}

/**
 * An empty Pair result, useful as a default.
 */
const EMPTY_PAIR_LIST: LPTokenAddressMap = {
  [ChainId.KOVAN]: {},
  [ChainId.RINKEBY]: {},
  [ChainId.ROPSTEN]: {},
  [ChainId.GÖRLI]: {},
  [ChainId.MAINNET]: {}
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

const lpListCache: WeakMap<TokenList, LPTokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, LPTokenAddressMap>() : null

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list)
  if (result) return result
  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map(tagId => {
            if (!list.tags?.[tagId]) return undefined
            return { ...list.tags[tagId], id: tagId }
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? []
      const token = new WrappedTokenInfo(tokenInfo, tags)
      if (tokenMap[token.chainId][token.address] !== undefined) throw Error('Duplicate tokens.')
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: token
        }
      }
    },
    { ...EMPTY_LIST }
  )
  listCache?.set(list, map)
  return map
}

export function listToLPTokenMap(list: TokenList, allPairs: string[]): LPTokenAddressMap {
  const result = lpListCache?.get(list)

  if (result) return result

  const map = list.tokens.reduce<LPTokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map(tagId => {
            if (!list.tags?.[tagId]) return undefined
            return { ...list.tags[tagId], id: tagId }
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? []

      const bases: Token[] = BASES_TO_BUILD_ZAPPER_LIST_AGAINST[tokenInfo.chainId]

      const lpTokens: WrappedLPTokenInfo[] = bases.map(baseToken => {
        if (baseToken.symbol === tokenInfo.symbol) {
          return false
        }
        const baseTokenInfo: TokenInfo = {
          address: baseToken.address,
          chainId: baseToken.chainId,
          decimals: baseToken.decimals,
          name: baseToken.name ?? '',
          symbol: baseToken.symbol ?? '',
          logoURI: baseToken.logoURI ?? ''
        }

        return new WrappedLPTokenInfo(
          tokenInfo.chainId,
          new WrappedTokenInfo(baseTokenInfo, []),
          new WrappedTokenInfo(tokenInfo, tags),
          tags
        )
      })

      if (tokenMap[tokenInfo.chainId][tokenInfo.address] !== undefined) throw Error('Duplicate tokens.')

      const filteredLpTokens = lpTokens.filter(Boolean).filter(lpToken => allPairs.includes(lpToken.address))

      const internalMap = filteredLpTokens.reduce(
        (lpTokenMap, lpToken) => {
          return {
            ...lpTokenMap,
            [lpToken.chainId]: {
              ...lpTokenMap[lpToken.chainId],
              [lpToken.address]: lpToken
            }
          }
        },
        { ...EMPTY_PAIR_LIST }
      )
      return {
        ...tokenMap,
        // ...internalMap
        [tokenInfo.chainId]: {
          ...tokenMap[tokenInfo.chainId],
          ...internalMap[tokenInfo.chainId]
        }
      }
    },
    { ...EMPTY_PAIR_LIST }
  )
  lpListCache?.set(list, map)
  return map
}

export function useTokenList(url: string | undefined): TokenAddressMap {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  return useMemo(() => {
    if (!url) return EMPTY_LIST
    const current = lists[url]?.current
    if (!current) return EMPTY_LIST
    try {
      return listToTokenMap(current)
    } catch (error) {
      console.error('Could not show token list due to error', error)
      return EMPTY_LIST
    }
  }, [lists, url])
}

export function useLPTokenList(url: string | undefined): LPTokenAddressMap {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  const allPairs = useAllPairs()

  return useMemo(() => {
    if (!url) return EMPTY_PAIR_LIST
    const current = lists[url]?.current
    if (!current) return EMPTY_PAIR_LIST
    try {
      return listToLPTokenMap(current, allPairs)
    } catch (error) {
      console.error('Could not show token list due to error', error)
      return EMPTY_PAIR_LIST
    }
  }, [allPairs, lists, url])
}

export function useSelectedListUrl(): string | undefined {
  return useSelector<AppState, AppState['lists']['selectedListUrl']>(state => state.lists.selectedListUrl)
}

export function useSelectedTokenList(): TokenAddressMap {
  return useTokenList(useSelectedListUrl())
}

export function useSelectedLPTokenList(): LPTokenAddressMap {
  return useLPTokenList(useSelectedListUrl())
}

export function useSelectedListInfo(): { current: TokenList | null; pending: TokenList | null; loading: boolean } {
  const selectedUrl = useSelectedListUrl()
  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  const list = selectedUrl ? listsByUrl[selectedUrl] : undefined
  return {
    current: list?.current ?? null,
    pending: list?.pendingUpdate ?? null,
    loading: list?.loadingRequestId !== null
  }
}

// returns all downloaded current lists
export function useAllLists(): TokenList[] {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)

  return useMemo(
    () =>
      Object.keys(lists)
        .map(url => lists[url].current)
        .filter((l): l is TokenList => Boolean(l)),
    [lists]
  )
}

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

const PAIR_ADDRESSES_CACHE = {
  "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3": {
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": "0x7e2a13b40fc1119ec55e0bcf9428eedaa581ab3c924561ad4e955f95da63138",
    "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8": "0xcfd39f5244f7b617418c018204a8a9f9a7f72e71f0ef38f968eeb2a9ca302b",
    "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8": "0xf0f5b3eed258344152e1f17baf84a2e1b621cd754b625bec169e8595aea767",
    "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac": "0x39c183c8e5a2df130eefa6fbaa3b8aad89b29891f6272cb0c90deaa93ec6315"
  },
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": {
    "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8": "0x4d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a",
    "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8": "0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6"
  },
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8": {
    "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8": "0x5801bdad32f343035fb242e98d1e9371ae85bc1543962fedea16c59b35bd19b"
  },
  "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac": {
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": "0x260e98362e0949fefff8b4de85367c035e44f734c9f8069b6ce2075ae86b45c",
    "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8": "0x5a8054e5ca0b277b295a830e53bd71a6a6943b42d0dbb22329437522bc80c8",
    "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8": "0x44d13ad98a46fd2322ef2637e5e4c292ce8822f47b7cb9a1d581176a801c1a0"
  },
  "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9": {
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": "0xaa77901620bdae04ffe72235a50f53c02c4bdfccbe00e86f99ae6373064d3c"
  },
  "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426": {
    "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9": "0x28f52998d929a360ef05fb3786ca5c4749e0d525020cda6277e07f71f4bace2",
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": "0x5a2b2b37f66157f767ea711cb4e034c40d41f2f5acf9ff4a19049fa11c1a884",
    "0x0386e8d061177f19b3b485c20e31137e6f6bc497cc635ccdfcab96fadf5add6a": "0x5f39e4b687e3775c66a2ba3e55cb361c957ccd561c877368d417fd964f9a69e",
    "0x012d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56": "0x2ca3d758eafe0b2dcffe44a020e0a9f40361727150515cf0a39aec6d17f8e20"
  },
  "0x0386e8d061177f19b3b485c20e31137e6f6bc497cc635ccdfcab96fadf5add6a": {
    "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9": "0x183a7f36f4d3e73ac57cf67952ec36ce50d6fab825b6095495648e179fb62aa",
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": "0x1cd850a56b6c77969b49f7e90cf50c1577cb80f232ec71a58b86c54183ac7d7"
  },
  "0x012d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56": {
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": "0x18f5acc7136467c4eb67c394befadb2093bf3497396a94f3ac1fb02681407ba",
    "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9": "0x67cabb77b1f6fcab1756b86c177efc51209dae973b70194eac690949d5f6b2d",
    "0x0386e8d061177f19b3b485c20e31137e6f6bc497cc635ccdfcab96fadf5add6a": "0x4fd9470599d9fd140627a9293a44394a7fd6833a6a8cb2f500fe1c5ba525fdf"
  }
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

    const tokens = token0.sortsBefore(token1) ? [token0, token1] : [token1, token0]
    const address = PAIR_ADDRESSES_CACHE?.[tokens[0].address]?.[tokens[1].address] ?? Pair.getAddress(token0, token1);

    super(chainId, token0, token1, address)

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

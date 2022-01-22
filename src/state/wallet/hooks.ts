import { Currency, CurrencyAmount, TOKEN0, JSBI, Token, TokenAmount, WTOKEN0 } from '@jediswap/sdk'
import { useMemo } from 'react'
import ERC20_ABI from '../../constants/abis/erc20.json'
import { useAllTokens } from '../../hooks/Tokens'
import { useActiveStarknetReact } from '../../hooks'
import { isAddress } from '../../utils'
import { NEVER_RELOAD, useMultipleStarknetCallSingleData, useStarknetCall } from '../../hooks/useStarknet'
import { Abi, uint256 } from 'starknet'
import { useAddressNormalizer } from '../../hooks/useAddressNormalizer'
import { useTokenContract } from '../../hooks/useContract'

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
// export function useETHBalances(
//   uncheckedAddresses?: (string | undefined)[]
// ): { [address: string]: CurrencyAmount | undefined } {
//   const multicallContract = useMulticallContract()

//   const addresses: string[] = useMemo(
//     () =>
//       uncheckedAddresses
//         ? uncheckedAddresses
//             .map(isAddress)
//             .filter((a): a is string => a !== false)
//             .sort()
//         : [],
//     [uncheckedAddresses]
//   )

//   const results = useSingleContractMultipleData(
//     multicallContract,
//     'getEthBalance',
//     addresses.map(address => [address])
//   )

//   return useMemo(
//     () =>
//       addresses.reduce<{ [address: string]: CurrencyAmount }>((memo, address, i) => {
//         const value = results?.[i]?.result?.[0]
//         if (value) memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()))
//         return memo
//       }, {}),
//     [addresses, results]
//   )
// }

/**
 * Fetch Token0 balance for the given address
 * @param uncheckedAddress
 * @returns CurrencyAmount | undefined
 */

export function useToken0Balance(uncheckedAddress?: string): CurrencyAmount | undefined {
  const { chainId } = useActiveStarknetReact()

  const tokenContract = useTokenContract(WTOKEN0[chainId ?? 5].address)

  const address = useAddressNormalizer(uncheckedAddress)

  const result = useStarknetCall(tokenContract, 'balanceOf', { account: address }, NEVER_RELOAD).balance
  console.log('🚀 ~ file: hooks.ts ~ line 77 ~ useToken0Balance ~ result', result)

  return useMemo(() => {
    const value = result ? uint256.uint256ToBN(result as any) : undefined
    if (value && address) return CurrencyAmount.token0(JSBI.BigInt(value.toString()))
    return undefined
  }, [address, result])
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map(vt => vt.address), [validatedTokens])

  const balances = useMultipleStarknetCallSingleData(
    validatedTokenAddresses,
    ERC20_ABI as Abi[],
    'balanceOf',
    address ? { address } : undefined
  )

  const anyLoading: boolean = useMemo(() => balances.some(callState => !callState), [balances])

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
              const result = balances?.[i]?.balance
              // console.log('🚀 ~ file: hooks.ts ~ line 102 ~ result', result)
              const value = result ? uint256.uint256ToBN(result as any) : undefined
              const amount = value ? JSBI.BigInt(value.toString()) : undefined
              if (amount) {
                memo[token.address] = new TokenAmount(token, amount)
              }
              return memo
            }, {})
          : {},
      [address, validatedTokens, balances]
    ),
    anyLoading
  ]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (!token) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[]
): (CurrencyAmount | undefined)[] {
  // console.log('🚀 ~ file: hooks.ts ~ line 109 ~ tokens ', currencies?.[0] instanceof Token)
  const tokens = useMemo(() => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [], [
    currencies
  ])
  console.log('🚀 ~ file: hooks.ts ~ line 144 ~ tokens', tokens)

  const token0Balance = useToken0Balance(account)
  const tokenBalances = useTokenBalances(account, tokens)
  console.log('🚀 ~ file: hooks.ts ~ line 142 ~ tokenBalances', currencies, tokenBalances)
  const containsTOKEN0: boolean = useMemo(() => currencies?.some(currency => currency === TOKEN0) ?? false, [
    currencies
  ])

  return useMemo(
    () =>
      currencies?.map(currency => {
        if (!account || !currency) return undefined
        if (currency instanceof Token) return tokenBalances[currency.address]
        if (containsTOKEN0) return token0Balance
        return undefined
      }) ?? [],
    [account, containsTOKEN0, currencies, token0Balance, tokenBalances]
  )
}

export function useCurrencyBalance(account?: string, currency?: Currency): CurrencyAmount | undefined {
  console.log('🚀 ~ file: hooks.ts ~ line 128 ~ useCurrencyBalance ~ currency', currency)
  return useCurrencyBalances(account, [currency])[0]
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { account } = useActiveStarknetReact()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const balances = useTokenBalances(account ?? undefined, allTokensArray)
  return balances ?? {}
}

import { Currency, CurrencyAmount, ETHER, JSBI, Token, TokenAmount, WETH } from '@jediswap/sdk'
import { useMemo } from 'react'
import ERC20_ABI from '../../constants/abis/erc20.json'
import { useAllTokens } from '../../hooks/Tokens'
import { useActiveStarknetReact } from '../../hooks'
import { isAddress } from '../../utils'
import { Abi, uint256 } from 'starknet'
import { useAddressNormalizer } from '../../hooks/useAddressNormalizer'
import { useTokenContract } from '../../hooks/useContract'
import { useMultipleContractSingleData, useSingleCallResult } from '../multicall/hooks'

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

  const tokenContract = useTokenContract(WETH[chainId ?? 5].address)

  const address = useAddressNormalizer(uncheckedAddress)

  const balance = useSingleCallResult(tokenContract, 'balanceOf', { account: address ?? '' })

  const uint256Balance: uint256.Uint256 = useMemo(() => ({ low: balance?.result?.[0], high: balance?.result?.[1] }), [
    balance?.result
  ])

  return useMemo(() => {
    const value = balance ? uint256.uint256ToBN(uint256Balance) : undefined
    if (value && address) return CurrencyAmount.ether(JSBI.BigInt(value.toString()))
    return undefined
  }, [address, balance, uint256Balance])
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

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_ABI as Abi, 'balanceOf', {
    account: address ?? ''
  })

  const anyLoading: boolean = useMemo(() => balances.some(callState => callState.loading), [balances])

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
              // if (i % 2 === 1) continue

              // const resultLow = balances?.[i]?.result?.[0]
              // const resultHigh = balances?.[i]?.result?.[1]

              // const uint256Balance: uint256.Uint256 = { low: resultLow, high: resultHigh }
              // const value = resultLow && resultHigh ? uint256.uint256ToBN(uint256Balance) : undefined
              const value = balances?.[i]?.result?.[0]
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
  const tokens = useMemo(() => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [], [
    currencies
  ])

  const token0Balance = useToken0Balance(account)
  const tokenBalances = useTokenBalances(account, tokens)

  const containsTOKEN0: boolean = useMemo(() => currencies?.some(currency => currency === ETHER) ?? false, [currencies])

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
  return useCurrencyBalances(account, [currency])[0]
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { account, connectedAddress } = useActiveStarknetReact()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const balances = useTokenBalances(connectedAddress ?? undefined, allTokensArray)
  return balances ?? {}
}

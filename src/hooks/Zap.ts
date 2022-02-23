import { BASES_TO_CHECK_TRADES_AGAINST } from './../constants/index'
import { useMemo } from 'react'
import { useActiveStarknetReact } from '.'
import { Currency, CurrencyAmount, JSBI, LPToken, Pair, Token, TokenAmount, Trade } from '@jediswap/sdk'
import { wrappedCurrency, wrappedCurrencyAmount } from '../utils/wrappedCurrency'
import flatMap from 'lodash.flatmap'
import { PairState, usePair, usePairs } from '../data/Reserves'
import { useTotalSupply } from '../data/TotalSupply'

export function useZapPairs(inputCurrency?: Currency, outputLpToken?: LPToken): [Pair[], boolean] {
  const { chainId } = useActiveStarknetReact()

  const bases: Token[] = useMemo(() => (chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []), [chainId])

  const [inputToken, outputToken0, outputToken1] = chainId
    ? [
        wrappedCurrency(inputCurrency, chainId),
        wrappedCurrency(outputLpToken?.token0, chainId),
        wrappedCurrency(outputLpToken?.token1, chainId)
      ]
    : [undefined, undefined, undefined]

  const basePairs: [Token, Token][] = useMemo(
    () =>
      flatMap(bases, (base): [Token, Token][] => bases.map(otherBase => [base, otherBase])).filter(
        ([t0, t1]) => t0.address !== t1.address
      ),
    [bases]
  )

  const allPairCombinations: [Token, Token][] = useMemo(() => {
    if (inputToken && outputToken0 && outputToken1) {
      if (inputToken.address === outputToken0.address) {
        return [[inputToken, outputToken1]]
      } else if (inputToken.address === outputToken1.address) {
        return [[inputToken, outputToken0]]
      } else {
        return [
          /****  direct pairs ****/

          // 1st inputToken - outputToken0
          [inputToken, outputToken0],

          // 2nd inputToken - outputToken1
          [inputToken, outputToken1],

          /*********************/

          // inputToken against all bases
          ...bases.map((base): [Token, Token] => [inputToken, base]),

          // outputLpToken0 against all bases
          ...bases.map((base): [Token, Token] => [outputToken0, base]),

          // outputLpToken1 against all bases
          ...bases.map((base): [Token, Token] => [outputToken1, base]),

          // each base against all bases
          ...basePairs
        ]
          .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
          .filter(([t0, t1]) => t0.address !== t1.address)
      }
    }
    return []
  }, [basePairs, bases, inputToken, outputToken0, outputToken1])

  console.log('🚀 ~ file: Zap.ts ~ line 66 ~ useZapPairs ~ allPairCombinations', allPairCombinations)

  const allPairs = usePairs(allPairCombinations)

  const anyPairLoading = allPairs.some(([pairState]) => pairState === PairState.LOADING)

  return [
    useMemo(
      () =>
        Object.values(
          allPairs
            // filter out invalid pairs
            .filter((result): result is [PairState.EXISTS, Pair] =>
              Boolean(result[0] === PairState.EXISTS && result[1])
            )
            // filter out duplicated pairs
            .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
              memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
              return memo
            }, {})
        ),
      [allPairs]
    ),
    anyPairLoading
  ]
}

interface ZapTrades {
  tradeToken0Out: Trade | null
  tradeToken1Out: Trade | null
}

export function useZapTrades(currencyAmountIn?: CurrencyAmount, lpTokenOut?: LPToken): [ZapTrades | null, boolean] {
  const [allowedPairs, pairLoading] = useZapPairs(currencyAmountIn?.currency, lpTokenOut)

  return [
    useMemo(() => {
      if (currencyAmountIn && lpTokenOut && allowedPairs.length > 0) {
        const bestTradeToken0 =
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, lpTokenOut.token0, {
            maxHops: 3,
            maxNumResults: 1
          })[0] ?? null

        const bestTradeToken1 =
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, lpTokenOut.token1, {
            maxHops: 3,
            maxNumResults: 1
          })[0] ?? null

        return { tradeToken0Out: bestTradeToken0, tradeToken1Out: bestTradeToken1 }
      }
      return null
    }, [allowedPairs, currencyAmountIn, lpTokenOut]),
    pairLoading || allowedPairs.length === 0
  ]
}

// | {
//     token0?: { amount: TokenAmount; trade: Trade }
//     token1?: { amount: TokenAmount; trade: Trade }
//   }

export function useLPOutAmount(
  currencyAmountIn?: CurrencyAmount,
  lpTokenOut?: LPToken,
  trades?: ZapTrades | null
): [TokenAmount | undefined, Trade | null | undefined, boolean] {
  const { chainId } = useActiveStarknetReact()

  const tokenAmountIn = wrappedCurrencyAmount(currencyAmountIn, chainId)

  const inputToken = tokenAmountIn?.token

  const totalSupply = useTotalSupply(lpTokenOut)

  const [lpPairState, lpPair] = usePair(lpTokenOut?.token0, lpTokenOut?.token1)

  let amountOut0: TokenAmount, amountOut1: TokenAmount
  let lpAmountByToken0: TokenAmount, lpAmountByToken1: TokenAmount

  if (!tokenAmountIn || !inputToken || !totalSupply || !trades || !lpPair)
    return [undefined, undefined, lpPairState === PairState.LOADING]

  if (lpPair.token0.equals(inputToken)) {
    amountOut0 = new TokenAmount(inputToken, JSBI.divide(tokenAmountIn.raw, JSBI.BigInt(2)))
    ;[amountOut1] = lpPair.getOutputAmount(amountOut0)

    lpAmountByToken0 = calculateLPAmount(amountOut0, lpPair.reserve0, totalSupply)
    lpAmountByToken1 = calculateLPAmount(amountOut1, lpPair.reserve1, totalSupply)

    return [minLPAmountOut(lpAmountByToken0, lpAmountByToken1), trades.tradeToken1Out, false]
  } else if (lpPair.token1.equals(inputToken)) {
    amountOut1 = new TokenAmount(inputToken, JSBI.divide(tokenAmountIn.raw, JSBI.BigInt(2)))
    ;[amountOut0] = lpPair.getOutputAmount(amountOut1)

    lpAmountByToken0 = calculateLPAmount(amountOut0, lpPair.reserve0, totalSupply)
    lpAmountByToken1 = calculateLPAmount(amountOut1, lpPair.reserve1, totalSupply)

    return [minLPAmountOut(lpAmountByToken0, lpAmountByToken1), trades.tradeToken0Out, false]
  } else {
    const { tradeToken1Out, tradeToken0Out } = trades

    if (!tradeToken1Out && !tradeToken0Out) return [undefined, undefined, false]

    let amountOfToken0ByTrade0: TokenAmount | undefined, amountOfToken1ByTrade0: TokenAmount | undefined
    let amountOfToken0ByTrade1: TokenAmount | undefined, amountOfToken1ByTrade1: TokenAmount | undefined

    let lpAmountByTrade0: TokenAmount | undefined, lpAmountByTrade1: TokenAmount | undefined

    // Calculate LPAmount when tradeToken1Out is used
    if (tradeToken1Out) {
      // Amount of Token0
      const outputAmount = wrappedCurrencyAmount(tradeToken1Out.outputAmount, chainId)

      if (!outputAmount) return [undefined, undefined, false]

      amountOfToken0ByTrade0 = outputAmount
      ;[amountOfToken1ByTrade0] = lpPair.getOutputAmount(amountOfToken0ByTrade0)

      lpAmountByTrade0 = minLPAmountOut(
        calculateLPAmount(amountOfToken0ByTrade0, lpPair.reserve0, totalSupply),
        calculateLPAmount(amountOfToken1ByTrade0, lpPair.reserve1, totalSupply)
      )
    }

    // Calculate LPAmount when tradeToken0Out is used
    if (tradeToken0Out) {
      // Amount of Token1

      const outputAmount = wrappedCurrencyAmount(tradeToken0Out.outputAmount, chainId)

      if (!outputAmount) return [undefined, undefined, false]

      amountOfToken1ByTrade1 = outputAmount
      ;[amountOfToken0ByTrade1] = lpPair.getOutputAmount(amountOfToken1ByTrade1)

      lpAmountByTrade1 = minLPAmountOut(
        calculateLPAmount(amountOfToken0ByTrade1, lpPair.reserve0, totalSupply),
        calculateLPAmount(amountOfToken1ByTrade1, lpPair.reserve1, totalSupply)
      )
    }

    // 4 cases possible

    // Case 1: No trade0 and No trade1 ==> return undefined

    if (!lpAmountByTrade0 && !lpAmountByTrade1) return [undefined, undefined, false]

    // Case 2: trade0 but no trade1 ==> return [lpAmountByTrade0, Trade0]

    if (lpAmountByTrade0 && !lpAmountByTrade1) return [lpAmountByTrade0, tradeToken1Out, false]

    // Case 3: trade1 but no trade0 ==> return [lpAmountByTrade1, Trade1]

    if (!lpAmountByTrade0 && lpAmountByTrade1) return [lpAmountByTrade1, tradeToken0Out, false]

    // Case 4: trade0 and trade1 ==> return [maxLpAmount(), tradeThatGiveThisAmount]

    if (lpAmountByTrade0 && lpAmountByTrade1) {
      const finalLPAmount = maxLPAmountOut(lpAmountByTrade0, lpAmountByTrade1)
      const finalTrade = finalLPAmount === lpAmountByTrade0 ? tradeToken1Out : tradeToken0Out

      return [finalLPAmount, finalTrade, false]
    }

    return [undefined, undefined, lpPairState === PairState.LOADING]
  }
}

export function calculateLPAmount(
  tokenAmount: TokenAmount,
  reserve: TokenAmount,
  totalSupply: TokenAmount
): TokenAmount {
  const amount = JSBI.divide(JSBI.multiply(tokenAmount.raw, totalSupply.raw), reserve.raw)

  return new TokenAmount(tokenAmount.token, amount)
}

export function minLPAmountOut(lpAmount1: TokenAmount, lpAmount2: TokenAmount): TokenAmount {
  return JSBI.LT(lpAmount1.raw, lpAmount2) ? lpAmount1 : lpAmount2
}

export function maxLPAmountOut(lpAmount1: TokenAmount, lpAmount2: TokenAmount): TokenAmount {
  return JSBI.GT(lpAmount1.raw, lpAmount2) ? lpAmount1 : lpAmount2
}

/**
 * Given two trades, return the trade that gives maxLPAmounts. Also return LPAmounts
 */
// export function maxLPTrade()

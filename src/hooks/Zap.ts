import { BASES_TO_CHECK_TRADES_AGAINST } from '../constants'
import { useMemo } from 'react'
import { useActiveStarknetReact } from '.'
import { Currency, CurrencyAmount, JSBI, LPToken, Pair, Percent, Token, TokenAmount, Trade } from '@jediswap/sdk'
import { wrappedCurrency, wrappedCurrencyAmount } from '../utils/wrappedCurrency'
import flatMap from 'lodash.flatmap'
import { PairState, usePair, usePairs } from '../data/Reserves'
import { useTotalSupply } from '../data/TotalSupply'
import { Field } from '../state/zap/actions'

export function useZapInPairs(inputCurrency?: Currency, outputLpToken?: LPToken): [Pair[], boolean] {
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

export function useZapOutPairs(inputLpToken?: LPToken, outputCurrency?: Currency): [Pair[], boolean] {
  const { chainId } = useActiveStarknetReact()

  const bases: Token[] = useMemo(() => (chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []), [chainId])

  const [inputToken0, inputToken1, outputToken] = chainId
    ? [
        wrappedCurrency(inputLpToken?.token0, chainId),
        wrappedCurrency(inputLpToken?.token1, chainId),
        wrappedCurrency(outputCurrency, chainId)
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
    if (!(inputToken0 && inputToken1 && outputToken)) {
      return []
    }

    if (inputToken0.address === outputToken.address) {
      return [[inputToken1, outputToken]]
    }

    if (inputToken1.address === outputToken.address) {
      return [[inputToken0, outputToken]]
    }

    return [
      // 1st inputToken0 - outputToken
      [inputToken0, outputToken],

      // 1st inputToken1 - outputToken
      [inputToken1, outputToken],

      // outputToken against all bases
      ...bases.map((base): [Token, Token] => [outputToken, base]),

      // inputToken0 against all bases
      ...bases.map((base): [Token, Token] => [inputToken0, base]),

      // inputToken1 against all bases
      ...bases.map((base): [Token, Token] => [inputToken1, base]),

      // each base against all bases
      ...basePairs
    ]
      .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
      .filter(([t0, t1]) => t0.address !== t1.address)
  }, [basePairs, bases, inputToken0, inputToken1, outputToken])

  console.log('🚀 ~ file: Zap.ts ~ line 66 ~ useZapOutPairs ~ allPairCombinations', allPairCombinations)

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

export function useZapInTrades(currencyAmountIn?: CurrencyAmount, lpTokenOut?: LPToken): [ZapTrades | null, boolean] {
  const [allowedPairs, pairLoading] = useZapInPairs(currencyAmountIn?.currency, lpTokenOut)

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

export function useZapOutTrades(
  lpTokenIn?: LPToken,
  lpAmountIn?: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.LIQUIDITY_CURRENCY_A]?: CurrencyAmount
    [Field.LIQUIDITY_CURRENCY_B]?: CurrencyAmount
  },
  tokenOut?: Currency
): [ZapTrades | null, boolean] {
  const [allowedPairs, pairLoading] = useZapOutPairs(lpTokenIn, tokenOut)

  return [
    useMemo(() => {
      if (!(lpAmountIn && tokenOut && allowedPairs.length > 0)) {
        return null
      }
      if (!(lpAmountIn[Field.LIQUIDITY_CURRENCY_A] && lpAmountIn[Field.LIQUIDITY_CURRENCY_B])) {
        return null
      }

      const bestTradeToken0 =
        Trade.bestTradeExactIn(allowedPairs, lpAmountIn[Field.LIQUIDITY_CURRENCY_A], tokenOut, {
          maxHops: 3,
          maxNumResults: 1
        })[0] ?? null

      const bestTradeToken1 =
        Trade.bestTradeExactIn(allowedPairs, lpAmountIn[Field.LIQUIDITY_CURRENCY_B], tokenOut, {
          maxHops: 3,
          maxNumResults: 1
        })[0] ?? null

      return { tradeToken0Out: bestTradeToken0, tradeToken1Out: bestTradeToken1 }
    }, [lpAmountIn, tokenOut, allowedPairs]),
    pairLoading || allowedPairs.length === 0
  ]
}

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

  if (!tokenAmountIn || !inputToken || !totalSupply || !trades || !lpPair || !lpTokenOut)
    return [undefined, undefined, lpPairState === PairState.LOADING]

  if (lpPair.token0.equals(inputToken)) {
    amountOut0 = new TokenAmount(inputToken, JSBI.divide(tokenAmountIn.raw, JSBI.BigInt(2)))
    ;[amountOut1] = lpPair.getOutputAmount(amountOut0)

    lpAmountByToken0 = calculateLPAmount(amountOut0, lpTokenOut, lpPair.reserve0, totalSupply)
    lpAmountByToken1 = calculateLPAmount(amountOut1, lpTokenOut, lpPair.reserve1, totalSupply)

    return [minLPAmountOut(lpAmountByToken0, lpAmountByToken1), trades.tradeToken1Out, false]
  } else if (lpPair.token1.equals(inputToken)) {
    amountOut1 = new TokenAmount(inputToken, JSBI.divide(tokenAmountIn.raw, JSBI.BigInt(2)))
    ;[amountOut0] = lpPair.getOutputAmount(amountOut1)

    lpAmountByToken0 = calculateLPAmount(amountOut0, lpTokenOut, lpPair.reserve0, totalSupply)
    lpAmountByToken1 = calculateLPAmount(amountOut1, lpTokenOut, lpPair.reserve1, totalSupply)

    return [minLPAmountOut(lpAmountByToken0, lpAmountByToken1), trades.tradeToken0Out, false]
  } else {
    const { tradeToken0Out, tradeToken1Out } = trades

    if (!tradeToken1Out && !tradeToken0Out) return [undefined, undefined, false]

    let token0AmountTrade0: TokenAmount | undefined, token1AmountTrade0: TokenAmount | undefined
    let token0AmountTrade1: TokenAmount | undefined, token1AmountTrade1: TokenAmount | undefined

    let lpAmountTrade0: TokenAmount | undefined, lpAmountTrade1: TokenAmount | undefined

    // Calculate LPAmount when tradeToken0Out is used
    if (tradeToken0Out) {
      // Amount of Token0

      const outputAmount = wrappedCurrencyAmount(tradeToken0Out.outputAmount, chainId)

      if (!outputAmount) return [undefined, undefined, false]

      token0AmountTrade0 = new TokenAmount(outputAmount.token, JSBI.divide(outputAmount.raw, JSBI.BigInt(2)))
      ;[token1AmountTrade0] = lpPair.getOutputAmount(token0AmountTrade0)

      lpAmountTrade0 = minLPAmountOut(
        calculateLPAmount(token0AmountTrade0, lpTokenOut, lpPair.reserve0, totalSupply),
        calculateLPAmount(token1AmountTrade0, lpTokenOut, lpPair.reserve1, totalSupply)
      )
    }

    // Calculate LPAmount when tradeToken1Out is used
    if (tradeToken1Out) {
      // Amount of Token0
      const outputAmount = wrappedCurrencyAmount(tradeToken1Out.outputAmount, chainId)

      if (!outputAmount) return [undefined, undefined, false]

      token1AmountTrade1 = new TokenAmount(outputAmount.token, JSBI.divide(outputAmount.raw, JSBI.BigInt(2)))
      ;[token0AmountTrade1] = lpPair.getOutputAmount(token1AmountTrade1)

      lpAmountTrade1 = minLPAmountOut(
        calculateLPAmount(token1AmountTrade1, lpTokenOut, lpPair.reserve0, totalSupply),
        calculateLPAmount(token0AmountTrade1, lpTokenOut, lpPair.reserve1, totalSupply)
      )
    }

    // 4 cases possible

    // Case 1: No trade0 and No trade1 ==> return undefined

    if (!lpAmountTrade0 && !lpAmountTrade1) return [undefined, undefined, false]

    // Case 2: trade0 but no trade1 ==> return [lpAmountByTrade0, Trade0]

    if (lpAmountTrade0 && !lpAmountTrade1) return [lpAmountTrade0, tradeToken0Out, false]

    // Case 3: trade1 but no trade0 ==> return [lpAmountByTrade1, Trade1]

    if (!lpAmountTrade0 && lpAmountTrade1) return [lpAmountTrade1, tradeToken1Out, false]

    // Case 4: trade0 and trade1 ==> return [maxLpAmount(), tradeThatGiveThisAmount]

    if (lpAmountTrade0 && lpAmountTrade1) {
      const finalLPAmount = maxLPAmountOut(lpAmountTrade0, lpAmountTrade1)
      const finalTrade = finalLPAmount === lpAmountTrade0 ? tradeToken0Out : tradeToken1Out
      return [finalLPAmount, finalTrade, false]
    }

    return [undefined, undefined, lpPairState === PairState.LOADING]
  }
}

export function useCurrencyOutFromLpAmount(
  currencyAmountIn?: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.LIQUIDITY_CURRENCY_A]?: TokenAmount
    [Field.LIQUIDITY_CURRENCY_B]?: TokenAmount
  },
  outputCurrency?: Currency | undefined,
  trades?: ZapTrades | null
): [TokenAmount | undefined, Trade | null | undefined, boolean] {
  const { chainId } = useActiveStarknetReact()

  const tokenAmountA = currencyAmountIn?.[Field.LIQUIDITY_CURRENCY_A] ?? undefined
  const tokenA = currencyAmountIn?.[Field.LIQUIDITY_CURRENCY_A]?.token ?? undefined
  const tokenAmountB = currencyAmountIn?.[Field.LIQUIDITY_CURRENCY_B] ?? undefined
  const tokenB = currencyAmountIn?.[Field.LIQUIDITY_CURRENCY_B]?.token ?? undefined
  const outputToken = wrappedCurrency(outputCurrency, chainId)

  const [lpPairState, lpPair] = usePair(tokenA, tokenB);

  if (!(tokenA && tokenAmountA && tokenB && tokenAmountB && outputToken && trades)) {
    return [undefined, undefined, false]
  }

  const { tradeToken0Out, tradeToken1Out } = trades

  if (tokenA.equals(outputToken)) {
    if (!tradeToken1Out) {
      return [undefined, undefined, lpPairState === PairState.LOADING]
    }

    const outputTradeCurrencyAmount = wrappedCurrencyAmount(tradeToken1Out.outputAmount, chainId)

    if (!outputTradeCurrencyAmount) {
      return [undefined, undefined, lpPairState === PairState.LOADING]
    }

    const summarizedOutputAmount = JSBI.add(tokenAmountA.raw, outputTradeCurrencyAmount.raw)
    const finalTokenOutputAmount = new TokenAmount(tokenA, summarizedOutputAmount)

    return [finalTokenOutputAmount, tradeToken1Out, lpPairState === PairState.LOADING]
  }

  if (tokenB.equals(outputToken)) {
    if (!tradeToken0Out) {
      return [undefined, undefined, lpPairState === PairState.LOADING]
    }
    const outputTradeCurrencyAmount = wrappedCurrencyAmount(tradeToken0Out.outputAmount, chainId)
    if (!outputTradeCurrencyAmount) {
      return [undefined, undefined, false]
    }

    const summarizedOutputAmount = JSBI.add(tokenAmountB.raw, outputTradeCurrencyAmount.raw)
    const finalTokenOutputAmount = new TokenAmount(tokenB, summarizedOutputAmount)

    return [finalTokenOutputAmount, tradeToken0Out, lpPairState === PairState.LOADING]
  }

  if (!(tradeToken0Out && tradeToken1Out)) {
    return [undefined, undefined, lpPairState === PairState.LOADING]
  }

  let tokenAmountTrade0;
  let tokenAmountTrade1;

  // Calculate final amount when tradeToken0Out is used
  if (tradeToken0Out) {
    const outputAmount = wrappedCurrencyAmount(tradeToken0Out.outputAmount, chainId)
    if (!outputAmount) return [undefined, undefined, lpPairState === PairState.LOADING]
    tokenAmountTrade0 = new TokenAmount(outputToken, outputAmount.raw)
  }
  // Calculate final amount when tradeToken0Out is used
  if (tradeToken1Out) {
    const outputAmount = wrappedCurrencyAmount(tradeToken1Out.outputAmount, chainId)
    if (!outputAmount) return [undefined, undefined, lpPairState === PairState.LOADING]
    tokenAmountTrade1 = new TokenAmount(outputToken, outputAmount.raw)
  }

  const maxTradeAmount = maxTradeAmountOut(tokenAmountTrade0, tokenAmountTrade1);
  const finalTrade = (maxTradeAmount === tokenAmountTrade0) ? tradeToken0Out: tradeToken1Out;

  return [maxTradeAmount, finalTrade, lpPairState === PairState.LOADING];
}

export function calculateLPAmount(
  tokenAmount: TokenAmount,
  lpTokenOut: Token,
  reserve: TokenAmount,
  totalSupply: TokenAmount
): TokenAmount {
  const amount = JSBI.divide(JSBI.multiply(tokenAmount.raw, totalSupply.raw), reserve.raw)

  return new TokenAmount(lpTokenOut, amount)
}

export function minLPAmountOut(lpAmount1: TokenAmount, lpAmount2: TokenAmount): TokenAmount {
  return JSBI.LT(lpAmount1.raw, lpAmount2.raw) ? lpAmount1 : lpAmount2
}

export function maxLPAmountOut(lpAmount1: TokenAmount, lpAmount2: TokenAmount): TokenAmount {
  return JSBI.GT(lpAmount1.raw, lpAmount2.raw) ? lpAmount1 : lpAmount2
}

export function maxTradeAmountOut(tradeAmount1: TokenAmount, tradeAmount2: TokenAmount): TokenAmount {
  return JSBI.GT(tradeAmount1.raw, tradeAmount2.raw) ? tradeAmount1 : tradeAmount2
}

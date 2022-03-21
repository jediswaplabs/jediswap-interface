import { Currency, CurrencyAmount, Fraction, Pair, Percent } from '@jediswap/sdk'
import React, { useState } from 'react'
import { Text } from 'rebass'
import { ButtonGradient } from '../../components/Button'
import { RowBetween, RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'
import { PoolPriceBar } from './PoolPriceBar'
import PairPrice from '../../components/PairPrice'

export function ConfirmAddModalBottom({
  pair,
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd
}: {
  pair?: Pair | null
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)

  return (
    <>
      <RowBetween>
        <TYPE.body fontWeight={500}>{currencies[Field.CURRENCY_A]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <TYPE.body fontWeight={500}>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <TYPE.body fontWeight={500}>{currencies[Field.CURRENCY_B]?.symbol} Deposited</TYPE.body>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <TYPE.body fontWeight={500}>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</TYPE.body>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <TYPE.body fontWeight={500}>Price</TYPE.body>
        {pair ? (
          <PairPrice
            pair={pair}
            showInverted={showInverted}
            setShowInverted={setShowInverted}
            style={{ fontWeight: '500', justifyContent: 'center', alignItems: 'center', display: 'flex' }}
          ></PairPrice>
        ) : (
          '-'
        )}
      </RowBetween>

      <RowBetween>
        <TYPE.body fontWeight={500}>Share of Pool:</TYPE.body>
        <TYPE.body fontWeight={500}>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</TYPE.body>
      </RowBetween>
      <ButtonGradient style={{ margin: '20px 0 10px 0 ' }} onClick={onAdd}>
        <Text>{noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}</Text>
      </ButtonGradient>
    </>
  )
}

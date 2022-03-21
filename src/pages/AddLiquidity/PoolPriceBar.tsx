import { Currency, Pair, Percent, Price } from '@jediswap/sdk'
import React, { useContext, useState } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { AutoColumn } from '../../components/Column'
import PairPrice from '../../components/PairPrice'
import { AutoRow, RowBetween } from '../../components/Row'

import { ONE_BIPS } from '../../constants'
import { Field } from '../../state/mint/actions'
import { DMSansText, TYPE } from '../../theme'
import { Separator } from '../Pool/styleds'

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price,
  pair
}: {
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price
  pair?: Pair
}) {
  const theme = useContext(ThemeContext)

  const [showInverted, setShowInverted] = useState<boolean>(false)

  return (
    <AutoColumn gap="10px">
      <RowBetween>
        <Text fontWeight={700} fontSize={16} lineHeight={'100%'} color={theme.jediWhite}>
          Price
        </Text>
        <PairPrice pair={pair} showInverted={showInverted} setShowInverted={setShowInverted} />
      </RowBetween>

      <Separator />

      <RowBetween>
        <Text fontWeight={700} fontSize={16} lineHeight={'120%'} color={theme.jediWhite}>
          Pool share
        </Text>
        <DMSansText.largeHeader fontWeight={400} fontSize={16} lineHeight={'120%'} color={theme.jediWhite}>
          {noLiquidity && price
            ? '100'
            : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
          %
        </DMSansText.largeHeader>
      </RowBetween>
    </AutoColumn>
  )
}

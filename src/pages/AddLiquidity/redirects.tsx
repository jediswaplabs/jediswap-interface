import { validateAndParseAddress } from '@jediswap/starknet'
import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import AddLiquidity from './index'

export function RedirectToAddLiquidity() {
  return <Redirect to="/add/" />
}

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{64})-(0x[a-fA-F0-9]{64})$/
export function RedirectOldAddLiquidityPathStructure(props: RouteComponentProps<{ currencyIdA: string }>) {
  const {
    match: {
      params: { currencyIdA }
    }
  } = props

  const validatedCurrencyIdA = currencyIdA.startsWith('0x') ? validateAndParseAddress(currencyIdA) : currencyIdA
  const match = validatedCurrencyIdA.match(OLD_PATH_STRUCTURE)
  console.log('🚀 ~ file: redirects.tsx ~ line 17 ~ RedirectOldAddLiquidityPathStructure ~ match', match)
  if (match?.length) {
    return <Redirect to={`/add/${match[1]}/${match[2]}`} />
  }

  return <AddLiquidity {...props} />
}

export function RedirectDuplicateTokenIds(props: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const {
    match: {
      params: { currencyIdA, currencyIdB }
    }
  } = props
  if (currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Redirect to={`/add/${currencyIdA}`} />
  }
  return <AddLiquidity {...props} />
}

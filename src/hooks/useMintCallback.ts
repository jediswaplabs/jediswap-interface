import { jediTokensList } from './../constants/jediTokens'
import { Args, uint256, number, Call, stark, RawArgs } from 'starknet'
import { useCallback, useMemo, useState } from 'react'
import { useActiveStarknetReact } from './index'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useToken } from './Tokens'
import { useTokenContract } from './useContract'
import { isAddress } from '../utils'
import { tryParseAmount } from '../state/swap/hooks'
import { TokenAmount, WETH } from '@jediswap/sdk'

export enum MintState {
  VALID,
  INVALID
}

export function useMintCallback(): [MintState, () => Promise<void>] {
  const addTransaction = useTransactionAdder()
  // const tokenContract = useTokenContract(tokenAddress, true)

  const { connectedAddress, account, chainId } = useActiveStarknetReact()

  const token0 = WETH[chainId ?? 5]

  const jediTokens = Object.values({ [token0.address]: token0, ...jediTokensList })

  // const token = useToken()

  const validatedAddress = isAddress(connectedAddress)

  const mintState = useMemo(() => {
    if (!validatedAddress) return MintState.INVALID

    return MintState.VALID
  }, [validatedAddress])

  const mintCallback = useCallback(async () => {
    if (!validatedAddress || !account) return

    // create token calls

    const mintCalls: Call[] = jediTokens.map(token => {
      const tokenAmount = tryParseAmount('1000', token)
      const uint256TokenAmount = uint256.bnToUint256(
        tokenAmount ? tokenAmount.raw.toString() : new TokenAmount(token, '1000').raw.toString()
      )

      const mintArgs: RawArgs = {
        recipient: validatedAddress,
        amount: { type: 'struct', ...uint256TokenAmount }
      }

      const mintCalldata = stark.compileCalldata(mintArgs)

      return {
        contractAddress: token.address,
        entrypoint: 'mint',
        calldata: mintCalldata
      }
    })

    // if (!tokenAmount) return

    // if (!tokenContract.connectedTo) return

    // const mintArgs: Args = {
    //   recipient: validatedAddress,
    //   amount: { type: 'struct', ...uint256TokenAmount }
    // }

    // return tokenContract
    //   .invoke('mint', mintArgs)
    return account
      .execute(mintCalls)
      .then(response => {
        addTransaction(response, {
          summary: `Mint Jedi Test Tokens`
        })
      })
      .catch((error: Error) => {
        console.debug(`Failed to mint Jedi Test Token`, error)
        // throw error
      })
  }, [account, addTransaction, jediTokens, validatedAddress])

  return [mintState, mintCallback]
}

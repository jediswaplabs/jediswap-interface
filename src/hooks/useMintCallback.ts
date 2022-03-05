import { Args, uint256, number } from 'starknet'
import { useCallback, useMemo, useState } from 'react'
import { useActiveStarknetReact } from './index'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useToken } from './Tokens'
import { useTokenContract } from './useContract'
import { isAddress } from '../utils'
import { tryParseAmount } from '../state/swap/hooks'

export enum MintState {
  VALID,
  INVALID
}

export function useMintCallback(tokenAddress: string | undefined): [MintState, () => Promise<void>] {
  const addTransaction = useTransactionAdder()
  const tokenContract = useTokenContract(tokenAddress, true)
  const token = useToken(tokenAddress)
  const { connectedAddress, account } = useActiveStarknetReact()

  const validatedAddress = isAddress(connectedAddress)

  const mintState = useMemo(() => {
    if (!tokenAddress || !tokenContract || !token || !validatedAddress) return MintState.INVALID

    return MintState.VALID
  }, [token, tokenAddress, tokenContract, validatedAddress])

  const mintCallback = useCallback(async () => {
    if (!tokenAddress || !tokenContract || !token || !validatedAddress || !account) return

    const tokenAmount = tryParseAmount('1000', token)

    if (!tokenAmount) return

    if (!tokenContract.connectedTo) return

    const uint256TokenAmount = uint256.bnToUint256(tokenAmount.raw.toString())

    const mintArgs: Args = {
      recipient: validatedAddress,
      amount: { type: 'struct', ...uint256TokenAmount }
    }

    // return tokenContract
    //   .invoke('mint', mintArgs)
    return account
      .execute({
        contractAddress: tokenContract.connectedTo,
        entrypoint: 'mint',
        calldata: [number.toBN(validatedAddress).toString(), ...Object.values(uint256TokenAmount)]
      })
      .then(response => {
        addTransaction(response, {
          summary: `Mint ${tokenAmount.toExact()} ${token.symbol}`
        })
      })
      .catch((error: Error) => {
        console.debug(`Failed to mint ${token.symbol}`, error)
        throw error
      })
  }, [account, addTransaction, token, tokenAddress, tokenContract, validatedAddress])

  return [mintState, mintCallback]
}

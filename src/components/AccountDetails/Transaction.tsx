import React from 'react'
import styled from 'styled-components'
import { CheckSquare, AlertTriangle } from 'react-feather'
import { getStarkscanLink } from '../../utils'
import { ExternalLink } from '../../theme'
import { useAllTransactions } from '../../state/transactions/hooks'
import { RowFixed } from '../Row'
import Loader from '../Loader'

import { ExternalLink as LinkIcon } from 'react-feather'
import { useAccountDetails } from '../../hooks'

const TransactionWrapper = styled.div``

const TransactionStatusText = styled.div`
  margin-right: 0.5rem;
  /* display: flex;
  align-items: center; */
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 90%;
  display: block;

  :hover {
    text-decoration: underline;
  }
`

const TransactionState = styled(ExternalLink)<{ pending: boolean; success?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none !important;
  border-radius: 0.5rem;
  padding: 0.25rem 0rem;
  font-weight: 500;
  font-size: 0.825rem;
  color: ${({ theme }) => theme.primary1};
`
const PendingText = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  color: ${({ theme }) => theme.jediPink};
`

const IconWrapper = styled.div<{ pending: boolean; success?: boolean }>`
  color: ${({ pending, success, theme }) => (pending ? theme.primary1 : success ? theme.green1 : theme.red1)};
`

export default function Transaction({ hash }: { hash: string }) {
  const { chainId } = useAccountDetails()

  const allTransactions = useAllTransactions()

  const tx = allTransactions?.[hash]

  const summary = tx?.summary
  const rejected = tx && tx?.receipt?.status === 'REJECTED'
  const pending = tx && (!tx.receipt || tx?.receipt.status === 'PENDING' || tx?.receipt.status === 'RECEIVED')
  const success = !pending && !rejected

  if (!chainId) return null

  return (
    <TransactionWrapper>
      <TransactionState href={getStarkscanLink(chainId, hash, 'transaction')} pending={pending} success={success}>
        <RowFixed>
          <TransactionStatusText>{summary ?? hash} </TransactionStatusText>
          <LinkIcon size={16} />
        </RowFixed>
        <IconWrapper pending={pending} success={success}>
          {rejected ? (
            <AlertTriangle size="16" />
          ) : success ? (
            <CheckSquare size="16" />
          ) : (
            <PendingText>Pending</PendingText>
          )}
        </IconWrapper>
      </TransactionState>
    </TransactionWrapper>
  )
}

import { Status } from '@jediswap/starknet'
import React, { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { useActiveStarknetReact } from '../../hooks'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getVoyagerLink } from '../../utils'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

const StatusHeader = styled.div`
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
`
const TxSummary = styled.div`
  font-size: 12px;
  font-weight: normal;
  line-height: 120%;
`

export default function TransactionPopup({
  hash,
  status,
  summary
}: {
  hash: string
  status?: Status
  summary?: string
}) {
  const { chainId } = useActiveStarknetReact()

  const theme = useContext(ThemeContext)

  const getStatusHeader = (status: Status) => {
    switch (status) {
      case 'RECEIVED':
        return 'Received'
      case 'ACCEPTED_ON_L2':
        return 'Confirmed'
      case 'ACCEPTED_ON_L1':
        return 'Completed'
      case 'REJECTED':
        return 'Rejected'
      default:
        return 'Submitted'
    }
  }

  return (
    <RowNoFlex>
      <AutoColumn gap="5px">
        <StatusHeader style={{ paddingRight: 16 }}>
          {/* {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />} */}
          {status ? `Transaction ${getStatusHeader(status)}` : `Transaction Submitted`}
        </StatusHeader>
        <AutoColumn gap="8px">
          <TxSummary>{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</TxSummary>
          {chainId && <ExternalLink href={getVoyagerLink(chainId, hash, 'transaction')}>View on Voyager</ExternalLink>}
        </AutoColumn>
      </AutoColumn>
    </RowNoFlex>
  )
}

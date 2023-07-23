import { Status } from 'starknet'
import React, { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getStarkscanLink } from '../../utils'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
import TxReceivedIcon from '../../assets/jedi/tx/received.svg'
import TxConfirmedIcon from '../../assets/jedi/tx/confirmed.svg'
import TxCompletedIcon from '../../assets/jedi/tx/completed.svg'
import TxRejectedIcon from '../../assets/jedi/tx/rejected.svg'
import { ExternalLink as LinkIcon } from 'react-feather'
import { useAccount } from '@starknet-react/core'
import { useAccountDetails } from '../../hooks'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
  align-items: flex-start;
`

const StatusHeader = styled.div`
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
  color: ${({ theme }) => theme.jediWhite};
`
const TxSummary = styled.div`
  font-size: 12px;
  font-weight: normal;
  line-height: 120%;
  color: ${({ theme }) => theme.jediWhite};
`

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '24px')};
    width: ${({ size }) => (size ? size + 'px' : '24px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.jediBlue};
  font-size: 16px;
  font-weight: 700;
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
  const { account, chainId } = useAccountDetails()

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

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <IconWrapper>
            <img src={TxReceivedIcon} alt="Received" />
          </IconWrapper>
        )
      case 'ACCEPTED_ON_L2':
        return (
          <IconWrapper>
            <img src={TxConfirmedIcon} alt="Confirmed" />
          </IconWrapper>
        )
      case 'ACCEPTED_ON_L1':
        return (
          <IconWrapper>
            <img src={TxCompletedIcon} alt="Completed" />
          </IconWrapper>
        )
      case 'REJECTED':
        return (
          <IconWrapper>
            <img src={TxRejectedIcon} alt="Rejected" />
          </IconWrapper>
        )
      default:
        return (
          <IconWrapper>
            <img src={TxReceivedIcon} alt="Pending" />
          </IconWrapper>
        )
    }
  }

  return (
    <RowNoFlex>
      {status && getStatusIcon(status)}
      <AutoColumn gap="8px" style={{ marginTop: '1px' }}>
        <AutoRow>
          <StatusHeader style={{ paddingRight: 16 }}>
            {/* {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />} */}
            {status ? `Transaction ${getStatusHeader(status)}` : `Transaction Submitted`}
          </StatusHeader>
        </AutoRow>
        <AutoColumn gap="12px">
          <TxSummary>{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</TxSummary>
          {chainId && (
            <StyledExternalLink href={getStarkscanLink(chainId, hash, 'transaction')}>
              <span style={{ marginRight: '7px' }}>View on Starkscan</span>
              <LinkIcon size={20} style={{ color: '#50D5FF' }} />
            </StyledExternalLink>
          )}
        </AutoColumn>
      </AutoColumn>
    </RowNoFlex>
  )
}

import { Status } from '@jediswap/starknet'
import React, { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { useActiveStarknetReact } from '../../hooks'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getEtherscanLink } from '../../utils'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
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

  return (
    <RowNoFlex>
      <AutoColumn>
        <div style={{ paddingRight: 16 }}>
          {/* {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />} */}
          Transaction Status: {status?.split('_').join(' ')}
        </div>
        <AutoColumn gap="8px">
          <TYPE.body fontWeight={500}>{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</TYPE.body>
          {chainId && (
            <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')}>View on Etherscan</ExternalLink>
          )}
        </AutoColumn>
      </AutoColumn>
    </RowNoFlex>
  )
}

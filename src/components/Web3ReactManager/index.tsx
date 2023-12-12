import React from 'react'
import { useStarknetReact } from '@web3-starknet-react/core'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { NetworkContextName } from '../../constants'

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
`

const Message = styled.h2`
  color: ${({ theme }) => theme.secondary1};
`
export default function Web3ReactManager({ children }: { children: JSX.Element }) {
  const { t } = useTranslation()
  const { active } = useStarknetReact()
  const { error: networkError } = useStarknetReact(NetworkContextName)

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!active && networkError) {
    return (
      <MessageWrapper>
        <Message>{t('unknownError')}</Message>
      </MessageWrapper>
    )
  }

  return children
}

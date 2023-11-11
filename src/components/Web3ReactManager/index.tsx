import React, { useState, useEffect } from 'react'
import { useStarknetReact } from '@web3-starknet-react/core'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

// import { network } from '../../connectors'
import { useEagerConnect } from '../../hooks'
import { NetworkContextName } from '../../constants'
import Loader from '../Loader'

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
  const { active: networkActive, error: networkError, activate: activateNetwork } = useStarknetReact(NetworkContextName)

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  // useInactiveListener(!triedEager)

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false)

  // on page load, do nothing until we've tried to connect to the injected connector
  // if (!triedEager) {
  //   return null
  // }

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

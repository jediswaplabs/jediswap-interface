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

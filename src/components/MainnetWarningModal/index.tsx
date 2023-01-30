import React from 'react'
import Modal from '../Modal'
import { ButtonGradient } from '../Button'
import { ExternalLink, TYPE } from '../../theme'
import styled from 'styled-components'
import Row from '../Row'
import { AutoColumn } from '../Column'
import { AlertTriangle } from 'react-feather'

const WarningContainer = styled.div`
  width: 100%;
  padding: 1rem;
  background: rgba(242, 150, 2, 0.05);
  border: 1px solid #f3841e;
  overflow: auto;
`

const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.red2};
  width: 60px;
  height: 60px;
  margin: 40px 0 20px;
`

export const MainnetWarningModal = () => {
  // displays mainnetwarning modal on page load
  const [showMainnetWarningModal, setShowMainnetWarningModal] = React.useState(true)

  const hideMainnetWarningModal = () => {
    setShowMainnetWarningModal(false)
  }

  return showMainnetWarningModal ? (
    <Modal isOpen={showMainnetWarningModal} onDismiss={() => null}>
      <WarningContainer>
        <AutoColumn gap="lg">
          <Row flexDirection="column" gap="20px">
            <AutoColumn gap="lg" justify="center">
              <StyledWarningIcon />
              <TYPE.largeHeader color={'red2'}>MainNet Warning</TYPE.largeHeader>
            </AutoColumn>
            <TYPE.body textAlign="center" flex={1}>
              JediSwap is on StarkNet MainNet which is currently in Alpha stage. There will be a network upgrade by
              StarkWare (Regenesis) in next few month as outlined
              <ExternalLink href="https://medium.com/starkware/starknet-regenesis-the-plan-bd0219843ef4">
                {' '}
                here
              </ExternalLink>
              . Things can break on StarkNet MainNet and you might loose funds in an extreme scenario.
            </TYPE.body>
            <TYPE.body textAlign="center">
              JediSwap smart contracts are upgradable till the Regenesis to make sure users have the least impact due to
              the Regenesis.
            </TYPE.body>
            <TYPE.body textAlign="center" marginBottom={40}>
              Also JediSwap smart contracts are not audited yet and there can be bugs in the code which can also cause
              loss of funds.
            </TYPE.body>
          </Row>
        </AutoColumn>
        <ButtonGradient onClick={hideMainnetWarningModal} marginBottom={10}>
          <TYPE.mediumHeader fontWeight="bold">I understand the risks outlined above</TYPE.mediumHeader>
        </ButtonGradient>
      </WarningContainer>
    </Modal>
  ) : (
    <></>
  )
}

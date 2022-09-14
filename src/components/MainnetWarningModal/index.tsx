import Modal from '../Modal'
import { ButtonGradient } from '../Button'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../../state'
import { toggleMainnetWarning } from '../../state/user/actions'
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
  // displays mainnetwarning modal based on MainnetWarningModal state
  const showMainnetWarningModal = useSelector((state: AppState) => state.user.MainnetWarningVisible);
  const dispatch = useDispatch<AppDispatch>();

  const hideMainnetWarningModal = () => {
    dispatch(toggleMainnetWarning())
  }
  
  return showMainnetWarningModal ? (
    <Modal isOpen={showMainnetWarningModal} onDismiss={() => null}>
      <WarningContainer>
        <AutoColumn gap="lg">
            <Row flexDirection="column" gap="20px">
                <AutoColumn gap="lg" justify='center'>
                    <StyledWarningIcon />
                    <TYPE.largeHeader color={'red2'}>MainNet Warning</TYPE.largeHeader>
                </AutoColumn>
                <TYPE.body textAlign="center" flex={1}>
                    JediSwap is on StarkNet MainNet which is currently in <ExternalLink href=''>Alpha</ExternalLink>. There will be a state reset by StarkWare in Q4 outlines <ExternalLink href=''>here</ExternalLink>.
                </TYPE.body>
                <TYPE.body textAlign="center">
                    NFTs on MainNet may not migrate to the new network and may lose its value
                </TYPE.body>
                <TYPE.body textAlign="center" marginBottom={40}>
                    There will be a best effort attempt to migrate the NFTs during the state reset. However, successful migration cannot be guaranteed.
                </TYPE.body>
            </Row>
        </AutoColumn>
      <ButtonGradient onClick={hideMainnetWarningModal} marginBottom={10}>
        <TYPE.mediumHeader fontWeight="bold">
        I understand the risks outlined above
        </TYPE.mediumHeader>
      </ButtonGradient>
      </WarningContainer>
    </Modal>
  ) : <></>
}

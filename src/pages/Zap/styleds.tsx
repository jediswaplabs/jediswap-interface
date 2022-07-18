import styled from 'styled-components'
import { DMSansText } from '../../theme'

export const Wrapper = styled.div`
  position: relative;
`

export const HeaderRow = styled.div``

export const HeaderControlsPanel = styled.div`
  display: flex;
  margin-bottom: 14px;
`

export const HeaderControlsPanelSwitcher = styled.div``

export const HeaderControlsPanelSettings = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;
`

export const HeaderDescription = styled(DMSansText.mediumBody)`
  color: rgba(255, 255, 255, 0.8);
  line-height: 120%;
  margin-bottom: 14px !important;
`
export const HeaderNote = styled(DMSansText.subHeader)`
  padding: 10px 12px;
  color: ${({ theme }) => theme.jediWhite};
  background-color: ${({ theme }) => theme.jediNavyBlue};
  border-radius: 8px;
`

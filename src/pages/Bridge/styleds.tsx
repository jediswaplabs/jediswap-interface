import styled from 'styled-components'
import { DMSansText } from '../../theme'

export const Wrapper = styled.div`
  position: relative;
`
export const BridgeHeaderInfo = styled(DMSansText.mediumBody)`
  color: ${({ theme }) => theme.text1};
  line-height: 31.2px;
`
export const WalletDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  margin: 30px;
  padding: 10px
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.jediBlue};
`

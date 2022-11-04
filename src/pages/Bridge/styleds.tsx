import styled from 'styled-components'
import { DMSansText } from '../../theme'

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`
export const BridgeHeaderInfo = styled(DMSansText.mediumBody)`
  color: ${({ theme }) => theme.text1};
  line-height: 31.2px;
  font-weight: 400;
  margin: 20px;
`
export const WalletDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 23px;
  
  margin: 25px;
  padding:  16px 21px

  border: double 1px transparent;
  border-radius: 8px;
  border-image-source: linear-gradient(90deg, #E200FF -0.73%, #4BD4FF 100%);
  background-origin: border-box;
  border-image-slice: 1;
  background-clip: content-box, border-box;
`

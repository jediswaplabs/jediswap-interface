import styled from 'styled-components'
// import { Zap as ZapIcon } from 'react-feather'
import { DMSansText } from '../../theme'

export const Wrapper = styled.div`
  position: relative;
`

export const ZapHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

export const HeaderRow = styled.div`
  display: flex;
  // font-family: Soloist Title;
  font-size: 24px;
  // font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: -0.1em;
  text-align: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.jediWhite};
  // margin-bottom: 30px;
`

export const HeaderNote = styled.div`
  padding: 10px 12px;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0px;
  font-weight: normal;
  font-size: 14px;
  line-height: 120%;
  color: ${({ theme }) => theme.jediWhite};
  background-color: ${({ theme }) => theme.jediNavyBlue};
  border-radius: 8px;
`

export const ZapHeaderInfo = styled(DMSansText.mediumBody)`
  color: rgba(255, 255, 255, 0.8);
  line-height: 120%;
`

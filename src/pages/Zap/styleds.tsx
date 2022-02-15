import styled from 'styled-components'
import { Zap as ZapIcon } from 'react-feather'

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
export const StyledZapIcon = styled(ZapIcon)`
  /* fill: ${({ theme }) => theme.signalRed};
  stroke: ${({ theme }) => theme.jediNavyBlue}; */
  /* height: 30px;
  width: 24px; */
`

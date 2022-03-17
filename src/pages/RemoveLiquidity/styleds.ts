import { MaxButton } from './../Pool/styleds'
import NumericalInput from '../../components/NumericalInput'
import styled from 'styled-components'

export const StyledNumericalInput = styled(NumericalInput)`
  border: 1px solid #ffffff;
  border-radius: 4px;
  font-weight: 700;
`

export const InputWrapper = styled.div`
  position: relative;
`

export const StyledPercentSign = styled.div`
  position: absolute;
  z-index: 10;
  top: 12px;
  left: 60px;
  /* right: 12px; */
`
export const StyledMaxButton = styled(MaxButton)`
  font-size: 20px;
  line-height: 100%;
  font-family: 'DM Sans', sans-serif;
  color: ${({ theme }) => theme.jediWhite};
  border-radius: 4px;
`

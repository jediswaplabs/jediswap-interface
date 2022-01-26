import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'

export const ModalInfo = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: 1rem 1rem;
  margin: 0.25rem 0.5rem;
  justify-content: center;
  flex: 1;
  user-select: none;
`

export const FadedSpan = styled(RowFixed)`
  color: ${({ theme }) => theme.primary1};
  font-size: 14px;
`

export const PaddedColumn = styled(AutoColumn)`
  padding: 32px;
  padding-bottom: 12px;
`

export const MenuItem = styled(RowBetween)`
  padding: 12px 32px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 72px);
  grid-gap: 16px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background-color: ${({ theme, disabled }) => !disabled && `rgba(196, 196, 196, 0.01)`};
    /* background: rgba(196, 196, 196, 0.01); */
    box-shadow: inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3),
      inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
      inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

export const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 16px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  border: none;
  outline: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.jediWhite};
  /* border-style: solid; */
  /* border: 1px solid ${({ theme }) => theme.bg3}; */
  -webkit-appearance: none;
  font-family: 'DM Sans';
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0ch;
  box-shadow: inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3),
    inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
    inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  background: rgba(196, 196, 196, 0.01);

  ::placeholder {
    color: ${({ theme }) => theme.text3};
  }
  transition: border 100ms;
  :focus {
    /* border: 1px solid ${({ theme }) => theme.primary1}; */
    outline: none;
  }
`
export const Separator = styled.div`
  width: 100%;
  background: linear-gradient(to left, #50d5ff, #ef35ff);
  height: 1px;
`

export const SeparatorDark = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

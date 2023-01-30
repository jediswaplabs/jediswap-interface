import styled from 'styled-components'
import { Text } from 'rebass'
import { AutoRow } from '../../components/Row'

export const ClickableText = styled(Text)`
  :hover {
    cursor: pointer;
  }
  color: ${({ theme }) => theme.primary1};
`

export const HeaderRow = styled.div`
  display: flex;
  font-size: 24px;
  // font-style: normal;
  font-weight: 800;
  line-height: 100%;
  text-align: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.jediWhite};
  // margin-bottom: 30px;
`
export const Icon = styled.img<{ unlimited?: boolean; noMargin?: boolean }>`
  width: 100%;
  height: auto;
  max-width: ${({ unlimited }) => (unlimited ? 'auto' : '27px')};
  margin-bottom: ${({ noMargin }) => (!noMargin ? '30px' : 0)};
`
export const IconWrapper = styled.div`
  width: 100%;
  height: auto;
  max-width: 40px;
  margin-top: 24px;
  margin-bottom: -5px;
`
export const BalanceText = styled.div`
  display: flex;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  text-align: center;
  color: ${({ theme }) => theme.jediWhite};
  margin-bottom: 16px;

  svg {
    margin-left: 4px;
  }
`

export const Backdrop = styled.div<{
  top?: string
  bottom?: string
  left?: string
  curveRight?: boolean
  curveLeft?: boolean
}>`
  position: absolute;
  width: 10px;
  height: 80px;
  left: ${({ left }) => left};
  top: ${({ top }) => top};
  bottom: ${({ bottom }) => bottom};

  background: linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
    linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
  box-shadow: 0px 0px 18.9113px rgba(49, 255, 156, 0.7), 0px 0px 73.2115px rgba(49, 255, 156, 0.5),
    inset 0px 0px 7.32115px rgba(49, 255, 156, 0.5);

  border-radius: ${({ curveRight }) => (curveRight ? '30px 30px 0 0' : '0 0 30px 30px')};

  transform: matrix(0, 1, 1, 0, 0, 0);
`
export const AddTokenText = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-right: 8px;
  color: ${({ theme }) => theme.jediBlue};
`

export const AddTokenRow = styled(AutoRow)`
  font-size: 16px;
  font-weight: 700;
  margin-top: 28px;
  color: ${({ theme }) => theme.jediBlue};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: pointer;
  }
`

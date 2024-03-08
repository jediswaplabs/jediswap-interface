import styled from 'styled-components'
import { DMSansText } from '../../theme'

export const Wrapper = styled.div`
  position: relative;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  font-size: 24px;
  font-weight: 800;
  line-height: 100%;
`

export const HeaderRow = styled.div`
  display: flex;
  font-size: 24px;
  // font-style: normal;
  font-weight: 400;
  line-height: 24px;
  text-align: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.jediWhite};
  // margin-bottom: 30px;
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

export const HeaderNote = styled.div`
  padding: 10px 12px;
  font-family: 'DM Sans', sans-serif;
  font-weight: normal;
  font-size: 14px;
  line-height: 120%;
  color: ${({ theme }) => theme.jediWhite};
  background-color: ${({ theme }) => theme.jediNavyBlue};
  border-radius: 8px;
`

export const HeaderInfo = styled(DMSansText.mediumBody)`
  color: rgba(255, 255, 255, 0.8);
  line-height: 120%;
`

export const RewardsWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

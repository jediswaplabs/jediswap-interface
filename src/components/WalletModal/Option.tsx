import React from 'react'
import styled from 'styled-components'
import { ExternalLink } from '../../theme'
import { BorderWrapper } from '../AccountDetails'

const InfoCard = styled.button<{ active?: boolean }>`
  background-color: ${({ theme, active }) => (active ? theme.bg3 : theme.bg2)};
  padding: 2rem;
  outline: none;
  border: 1px solid;
  border-radius: 8px;
  width: 100% !important;
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primary1};
  }
  /* border-color: ${({ theme, active }) => (active ? 'transparent' : theme.bg3)}; */
`

const OptionCard = styled(InfoCard as any)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 1rem;
  background: ${({ theme }) => theme.jediNavyBlue};
`

const OptionCardLeft = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  justify-content: center;
  height: 100%;
`

const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean }>`
  margin-top: 0;
  &:hover {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
    /* border: ${({ clickable, theme }) => (clickable ? `1px solid ${theme.primary1}` : ``)}; */
  }
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`

const GreenCircle = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.green1};
    border-radius: 50%;
  }
`

const CircleWrapper = styled.div`
  color: ${({ theme }) => theme.green1};
  display: flex;
  justify-content: center;
  align-items: center;
`

const HeaderText = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  color: ${({ theme }) => theme.jediWhite};
  font-size: 1rem;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
`

const SubHeader = styled.div`
  color: ${({ theme }) => theme.jediWhite};
  margin-top: 10px;
  font-size: 12px;
  font-family: 'DM Sans', sans-serif;
`

const IconWrapper = styled.div<{ size?: number | null }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '24px')};
    width: ${({ size }) => (size ? size + 'px' : '24px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

export default function Option({
  link = null,
  clickable = true,
  size,
  onClick = null,
  color,
  header,
  subheader = null,
  icon,
  active = false,
  id
}: {
  link?: string | null
  clickable?: boolean
  size?: number | null
  onClick?: null | (() => void)
  color: string
  header: React.ReactNode
  subheader: React.ReactNode | null
  icon: string
  active?: boolean
  id: string
}) {
  const content = (
    <BorderWrapper>
      <OptionCardClickable id={id} onClick={onClick} clickable={clickable && !active} active={active}>
        <OptionCardLeft>
          <HeaderText color={color}>
            {active ? (
              <CircleWrapper>
                <GreenCircle>
                  <div />
                </GreenCircle>
              </CircleWrapper>
            ) : (
              ''
            )}
            {header}
          </HeaderText>
          {subheader && <SubHeader>{subheader}</SubHeader>}
        </OptionCardLeft>
        <IconWrapper size={size}>
          <img src={icon} alt={'Icon'} />
        </IconWrapper>
      </OptionCardClickable>
    </BorderWrapper>
  )
  if (link) {
    return <ExternalLink href={link}>{content}</ExternalLink>
  }

  return content
}

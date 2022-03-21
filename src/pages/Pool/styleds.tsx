import { Text } from 'rebass'
import styled from 'styled-components'
import { AutoColumn } from '../../components/Column'
import uImage from '../../assets/images/big_unicorn.png'
import noise from '../../assets/images/noise.png'

export const Wrapper = styled.div`
  position: relative;
`

export const ClickableText = styled(Text)`
  :hover {
    cursor: pointer;
  }
  color: ${({ theme }) => theme.jediGrey};
  /* font-style: italic; */
`
export const MaxButton = styled.button<{ width: string }>`
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.jediWhite};
  border-radius: 0.5rem;
  font-size: 1rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.25rem 0.5rem;
  `};
  font-weight: 500;
  cursor: pointer;
  margin: 0.25rem;
  overflow: hidden;
  color: ${({ theme }) => theme.jediWhite};
  :hover {
    border: 1px solid ${({ theme }) => theme.jediBlue};
    color: ${({ theme }) => theme.jediBlue};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.jediBlue};
    outline: none;
    color: ${({ theme }) => theme.jediBlue};
  }
`

export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`
export const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #2172e5 100%);
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
`

export const CardBGImage = styled.span<{ desaturate?: boolean }>`
  background: url(${uImage});
  width: 1000px;
  height: 600px;
  position: absolute;
  border-radius: 12px;
  opacity: 0.4;
  top: -100px;
  left: -100px;
  transform: rotate(-15deg);
  user-select: none;

  ${({ desaturate }) => desaturate && `filter: saturate(0)`}
`

export const CardNoise = styled.span`
  background: url(${noise});
  background-size: cover;
  mix-blend-mode: overlay;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
`

export const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 1.25rem 1.25rem;
  z-index: 1;
  opacity: ${({ disabled }) => disabled && '0.4'};
`
export const PriceText = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 65%;
`

export const Separator = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 0 -12px;
`

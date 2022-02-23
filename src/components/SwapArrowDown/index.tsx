import React from 'react'
import { ArrowDown } from 'react-feather'
import styled, { css } from 'styled-components'

const ArrowBorder = styled.div`
  width: max-content;
  padding: 2px;
  border-radius: 50%;
  background: linear-gradient(to top right, #50d5ff, #ef35ff);
`

const ArrowWrapper = styled.div<{ wrapperSize?: number; clickable: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ wrapperSize }) => (wrapperSize ? `${wrapperSize}px` : '30px')};
  height: ${({ wrapperSize }) => (wrapperSize ? `${wrapperSize}px` : '30px')};
  border-radius: 50%;
  background: ${({ theme }) => theme.jediNavyBlue};
  color: ${({ theme }) => theme.jediWhite};

  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

export function SwapArrowDown({
  wrapperSize,
  iconSize = 16,
  clickable = false,
  ...rest
}: {
  wrapperSize?: number
  iconSize?: number
  clickable?: boolean
}) {
  return (
    <ArrowBorder {...rest}>
      <ArrowWrapper wrapperSize={wrapperSize} clickable={clickable}>
        <ArrowDown size={iconSize} /*color={theme.text2}*/ style={{ /*marginLeft: '4px',*/ minWidth: '16px' }} />
      </ArrowWrapper>
    </ArrowBorder>
  )
}

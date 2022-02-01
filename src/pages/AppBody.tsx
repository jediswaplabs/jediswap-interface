import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div<{maxWidth?: string}>`
  position: relative;
  max-width: ${({maxWidth}) => maxWidth || '470px'};
  width: 100%;
  /* background: ${({ theme }) => theme.bg1}; */
  background: transparent;
  box-shadow: inset 0px 30.0211px 43.1072px -27.7118px rgba(255, 255, 255, 0.5), inset 0px 5.38841px 8.46749px -3.07909px #FFFFFF, inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3), inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3), inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  border-radius: 16px;
  // padding: 1rem;
  border: 1px solid ${({ theme }) => theme.jediBlue};
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode}) {
  return <BodyWrapper>{children}</BodyWrapper>
}

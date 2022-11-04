import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 470px;
  width: 100%;
  padding: 2rem;
  background: rgba(196, 196, 196, 0.01);
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: inset 0px 30.0211px 43.1072px -27.7118px rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(76.9772px);
  border-radius: 8px;
  border: 1px linear-gradient(90deg, #e200ff -0.73%, #4bd4ff 100%);
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}

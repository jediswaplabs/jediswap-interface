import React from 'react'
import styled from 'styled-components'

const ComingSoonText = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${({ theme }) => theme.jediWhite};
`

const Wrapper = styled.div`
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default function ComingSoon() {
  return (
    <Wrapper>
      <ComingSoonText>Coming Soon</ComingSoonText>
    </Wrapper>
  )
}

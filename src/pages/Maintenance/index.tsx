import React from 'react'
import styled from 'styled-components'

import banner from './banner.svg'

const Title = styled.div`
  font-size: 30px;
  font-weight: bold;
  color: ${({ theme }) => theme.jediWhite};
  margin-bottom: 24px;
`

const Description = styled.div`
  font-size: 24px;
  font-weight: 400;
  color: ${({ theme }) => theme.jediWhite};
`

const Wrapper = styled.div`
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`

const Banner = styled.img`
  max-width: 450px;
  margin-bottom: 70px;
`

export default function Maintenance({ pageTitle }) {
  return (
    <Wrapper>
      <Banner src={banner} />
      <Title>{pageTitle || 'This page'} is Under Maintenance</Title>
      <Description>The page you're looking for is currently under maintenance and will be back soon.</Description>
    </Wrapper>
  )
}

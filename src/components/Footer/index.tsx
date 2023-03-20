import React from 'react'
import styled from 'styled-components'
import Column, { AutoColumn } from '../Column'
import Row, { RowBetween, RowStart } from '../Row'
import TwitterIcon from '../../assets/svg/Twitter.svg'
import DiscordIcon from '../../assets/svg/Discord.svg'
import GithubIcon from '../../assets/svg/github.svg'
import DocIcon from '../../assets/svg/doc.svg'
import { ExternalLink } from '../../theme'
import Polling from '../Header/Polling'

const FooterWrapper = styled.div`
  position: fixed;
  z-index: 1;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 27px 50px;
`
export default function Footer() {
  return (
    <FooterWrapper>
      <RowBetween>
        <RowStart gap={'26px'}>
          <ExternalLink href="https://twitter.com/JediSwap">
            <img src={TwitterIcon} alt="Twitter" />
          </ExternalLink>
          <ExternalLink href="https://discord.com/invite/9sAPRUfv7t">
            <img src={DiscordIcon} alt="Discord" />
          </ExternalLink>
          <ExternalLink href="https://github.com/jediswaplabs">
            <img src={GithubIcon} alt="Github" />
          </ExternalLink>
          <ExternalLink href=" https://bip.so/@meshfinance/public">
            <img src={DocIcon} alt="'Docs" />
          </ExternalLink>
        </RowStart>
        <Polling />
      </RowBetween>
    </FooterWrapper>
  )
}

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

const ClickableExternalLink = styled(ExternalLink)`
  pointer-events: all;
`

const FooterWrapper = styled.div`
  pointer-events: none;
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
          <ClickableExternalLink href="https://twitter.com/JediSwap">
            <img src={TwitterIcon} alt="Twitter" />
          </ClickableExternalLink>
          <ClickableExternalLink href="https://discord.com/invite/9sAPRUfv7t">
            <img src={DiscordIcon} alt="Discord" />
          </ClickableExternalLink>
          <ClickableExternalLink href="https://github.com/jediswaplabs">
            <img src={GithubIcon} alt="Github" />
          </ClickableExternalLink>
          <ClickableExternalLink href="https://docs.jediswap.xyz">
            <img src={DocIcon} alt="'Docs" />
          </ClickableExternalLink>
        </RowStart>
        <Polling />
      </RowBetween>
    </FooterWrapper>
  )
}

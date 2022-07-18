import React, { useCallback } from 'react'
import styled from 'styled-components'

import { ReactComponent as ZapIcon } from '../../assets/jedi/zap.svg'

export const ZapModeTabs = styled.div`
  display: flex;
`
export const ZapModeTab = styled.div<{ active: boolean }>`
  display: flex;
  font-family: 'Avenir LT Std';
  font-weight: 800;
  font-size: 20px;
  text-transform: uppercase;
  padding: 10px 20px;
  border-radius: 8px;
  color: ${({ theme }) => theme.jediWhite};
  background-color: ${props => (props.active ? ({ theme }) => theme.jediNavyBlue : 'transparent')};
  cursor: pointer;

  svg {
    transform: rotate(${props => (props.active ? 0 : 180)}deg);
    margin-right: 8px;
    fill: ${props => (props.active ? ({ theme }) => theme.jediBlue : '#fff')};
  }
`

export default function ZapModeSwitcher({
  modes,
  activeMode,
  onChange
}: {
  modes: { id: string; name: string; description: string }[]
  activeMode: string
  onChange: (modeId: string) => void
}) {
  const handleTabClick = useCallback(
    id => e => {
      e.preventDefault()
      onChange(id)
    },
    [onChange]
  )

  return (
    <React.Fragment>
      <ZapModeTabs>
        {modes.map(mode => {
          return (
            <React.Fragment key={mode.id}>
              <ZapModeTab active={activeMode === mode.id} onClick={handleTabClick(mode.id)}>
                <ZapIcon /> {mode.name}
              </ZapModeTab>
            </React.Fragment>
          )
        })}
      </ZapModeTabs>
    </React.Fragment>
  )
}

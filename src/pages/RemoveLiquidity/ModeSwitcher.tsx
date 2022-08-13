import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Switch from 'react-switch'
import { DMSansText } from '../../theme'

// see https://github.com/vitejs/vite/issues/2139#issuecomment-806416318
// @ts-ignore
const SwitchComponent = Switch.default ? Switch.default : Switch

const StyledLabel = styled.label`
  display: flex;
  align-items: center;
  column-gap: 12px;
`

export interface ModeSwitcherProps {
  showDetailed: boolean
  onChange: () => void
}

export default function ModeSwitcher({ showDetailed, onChange }: ModeSwitcherProps) {
  const theme = useContext(ThemeContext)

  return (
    <StyledLabel>
      <DMSansText.mediumBody fontSize={15}>Detailed</DMSansText.mediumBody>
      <SwitchComponent
        onChange={onChange}
        checked={showDetailed}
        onColor="#305398"
        onHandleColor={theme.jediBlue}
        handleDiameter={20}
        uncheckedIcon={false}
        checkedIcon={false}
        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
        height={14}
        width={34}
        className="react-switch"
        id="material-switch"
        draggable={false}
      />
    </StyledLabel>
  )
}

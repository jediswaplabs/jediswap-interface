import React from 'react'
import styled from 'styled-components'
import useHttpLocations from '../../hooks/useHttpLocations'

import Logo from '../Logo'

const StyledListLogo = styled(Logo)``

export default function ListLogo({
  logoURI,
  style,
  size = 24,
  alt
}: {
  logoURI: string
  size?: number
  style?: React.CSSProperties
  alt?: string
}) {
  const srcs: string[] = useHttpLocations(logoURI)

  return <StyledListLogo alt={alt} size={size} srcs={srcs} style={style} />
}

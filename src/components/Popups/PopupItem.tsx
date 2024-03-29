import React, { useCallback, useContext, useEffect } from 'react'
import { X } from 'react-feather'
import { useSpring } from 'react-spring/web'
import styled, { ThemeContext } from 'styled-components'
import { animated } from 'react-spring'
import { PopupContent } from '../../state/application/actions'
import { useRemovePopup } from '../../state/application/hooks'
import ListUpdatePopup from './ListUpdatePopup'
import TransactionPopup from './TransactionPopup'

export const StyledClose = styled(X)`
  position: absolute;
  right: 10px;
  top: 10px;

  :hover {
    cursor: pointer;
  }
`
export const PopupWrapper = styled.div`
  background: linear-gradient(200.98deg, #ef35ff 1.04%, #50d5ff 55.28%);
  padding: 2px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const Popup = styled.div`
  display: inline-block;
  width: 100%;
  padding: 1em;
  background-color: ${({ theme }) => theme.jediNavyBlue};
  position: relative;
  border-radius: 8px;
  padding: 20px;
  padding-right: 35px;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 290px;
  `}
`
const Fader = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 2px;
  background-color: ${({ theme }) => theme.bg3};
`

const AnimatedFader = animated(Fader)

export default function PopupItem({
  removeAfterMs,
  content,
  popKey
}: {
  removeAfterMs: number | null
  content: PopupContent
  popKey: string
}) {
  const removePopup = useRemovePopup()
  const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup])
  useEffect(() => {
    if (removeAfterMs === null) return undefined

    const timeout = setTimeout(() => {
      removeThisPopup()
    }, removeAfterMs)

    return () => {
      clearTimeout(timeout)
    }
  }, [removeAfterMs, removeThisPopup])

  const theme = useContext(ThemeContext)

  let popupContent
  if ('txn' in content) {
    const {
      txn: { hash, status, summary }
    } = content
    popupContent = <TransactionPopup hash={hash} status={status} summary={summary} />
  } else if ('listUpdate' in content) {
    const {
      listUpdate: { listUrl, oldList, newList, auto }
    } = content
    popupContent = <ListUpdatePopup popKey={popKey} listUrl={listUrl} oldList={oldList} newList={newList} auto={auto} />
  }

  const faderStyle = useSpring({
    from: { width: '100%' },
    to: { width: '0%' },
    config: { duration: removeAfterMs ?? undefined }
  })

  return (
    <PopupWrapper>
      <Popup>
        <StyledClose color={theme.text2} onClick={removeThisPopup} />
        {popupContent}
        {/* {removeAfterMs !== null ? <AnimatedFader style={faderStyle} /> : null} */}
      </Popup>
    </PopupWrapper>
  )
}

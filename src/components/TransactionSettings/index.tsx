import React, { useState, useRef, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'

import QuestionHelper from '../QuestionHelper'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'

import { darken } from 'polished'

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh'
}

enum DeadlineError {
  InvalidInput = 'InvalidInput'
}

const SlippageText = styled.div`
  font-family: DM Sans;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
`

const SlippageWrapper = styled.div`
  background: rgba(196, 196, 196, 0.01);
  box-shadow: inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3),
    inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
    inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
`

const FancyButton = styled.button`
  color: ${({ theme }) => theme.text1};
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 16px;
  line-height: 100%;
  width: auto;
  min-width: 3.5rem;
  border: 1px solid ${({ theme }) => theme.jediWhite};
  outline: none;
  background: ${({ theme }) => theme.bg1};
  :hover {
    border: 1px solid ${({ theme }) => theme.bg4};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
  }
  padding: 8px;
`

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 10px;
  :hover {
    cursor: pointer;
  }
  background-color: ${({ active, theme }) => (active ? theme.jediNavyBlue : 'transparent')};
  color: ${({ active, theme }) => (active ? theme.white : theme.jediWhite)};
  font-family: 'DM Sans', sans-serif;
  border-radius: 4px;
  border-color: ${({ active, theme }) => active && theme.jediBlue};
`

const Input = styled.input`
  background: ${({ theme }) => theme.jediBlue};
  font-size: 16px;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme }) => theme.jediWhite};
  text-align: right;
`

const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) => active && `1px solid ${warning ? theme.red1 : theme.primary1}`};
  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(0.1, theme.red1) : darken(0.1, theme.primary1)}`};
  }

  /* background-color: ${({ active, theme }) => (active ? theme.jediNavyBlue : 'transparent')};  */
  background-color: ${({ theme }) => theme.jediNavyBlue};
  color: ${({ active, theme }) => (active ? theme.white : theme.jediWhite)};
  font-family: 'DM Sans', sans-serif;
   border-radius: 4px;
  border-color: ${({ active, theme }) => active && theme.jediBlue};
  margin-right: 16px;
  padding-left:5px ;

  input {
    width: 100%;
    min-width: 40px;
    text-align: left;
    height: 100%;
    border: 0px;
    border-radius: 4px;
    background-color: transparent;
    font-family: 'DM Sans', sans-serif;
     font-size: 16px;
  }
`

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;  
  `}
`

const MinutesText = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  padding-left: 8px;
  color: ${({ theme }) => theme.jediWhite};
`

export interface SlippageTabsProps {
  rawSlippage: number
  setRawSlippage: (rawSlippage: number) => void
  deadline: number
  setDeadline: (deadline: number) => void
}

export default function SlippageTabs({ rawSlippage, setRawSlippage, deadline, setDeadline }: SlippageTabsProps) {
  const theme = useContext(ThemeContext)

  const inputRef = useRef<HTMLInputElement>()

  const [slippageInput, setSlippageInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')

  const slippageInputIsValid =
    slippageInput === '' || (rawSlippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
  const deadlineInputIsValid = deadlineInput === '' || (deadline / 60).toString() === deadlineInput

  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && rawSlippage < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && rawSlippage > 500) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  let deadlineError: DeadlineError | undefined
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput
  } else {
    deadlineError = undefined
  }

  function parseCustomSlippage(value: string) {
    setSlippageInput(value)

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setRawSlippage(valueAsIntFromRoundedFloat)
      }
    } catch {}
  }

  function parseCustomDeadline(value: string) {
    setDeadlineInput(value)

    try {
      const valueAsInt: number = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setDeadline(valueAsInt)
      }
    } catch {}
  }

  return (
    <AutoColumn gap="md">
      <AutoColumn gap="sm">
        <RowFixed>
          <SlippageText>Slippage tolerance</SlippageText>
          {/* <QuestionHelper text="Your transaction will revert if the price changes unfavorably by more than this percentage." /> */}
        </RowFixed>
        <SlippageWrapper>
          <RowBetween>
            <OptionCustom active={![10, 50, 100].includes(rawSlippage)} warning={!slippageInputIsValid} tabIndex={-1}>
              <RowBetween>
                {!!slippageInput &&
                (slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh) ? (
                  <SlippageEmojiContainer>
                    <span role="img" aria-label="warning">
                      ⚠️
                    </span>
                  </SlippageEmojiContainer>
                ) : null}
                {/* https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451 */}
                <Input
                  ref={inputRef as any}
                  placeholder={(rawSlippage / 100).toFixed(1)}
                  value={slippageInput}
                  onBlur={() => {
                    parseCustomSlippage((rawSlippage / 100).toFixed(2))
                  }}
                  onChange={e => parseCustomSlippage(e.target.value)}
                  color={!slippageInputIsValid ? 'red' : ''}
                />
                %
              </RowBetween>
            </OptionCustom>
            <Option
              onClick={() => {
                setSlippageInput('')
                setRawSlippage(10)
              }}
              active={rawSlippage === 10}
            >
              0.1%
            </Option>
            <Option
              onClick={() => {
                setSlippageInput('')
                setRawSlippage(50)
              }}
              active={rawSlippage === 50}
            >
              0.5%
            </Option>
            <Option
              onClick={() => {
                setSlippageInput('')
                setRawSlippage(100)
              }}
              active={rawSlippage === 100}
            >
              1%
            </Option>
          </RowBetween>
        </SlippageWrapper>
        {!!slippageError && (
          <RowBetween
            style={{
              fontSize: '14px',
              paddingTop: '7px',
              color: slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E',
              fontFamily: "'DM Sans', 'sans-serif'",
              letterSpacing: '0px'
            }}
          >
            {slippageError === SlippageError.InvalidInput
              ? 'Enter a valid slippage percentage'
              : slippageError === SlippageError.RiskyLow
              ? 'Your transaction may fail'
              : 'Your transaction may be frontrun'}
          </RowBetween>
        )}
      </AutoColumn>

      <AutoColumn gap="sm">
        <RowFixed>
          <SlippageText>Transaction deadline</SlippageText>
          {/* <QuestionHelper text="Your transaction will revert if it is pending for more than this long." /> */}
        </RowFixed>
        <SlippageWrapper>
          <RowFixed>
            <OptionCustom style={{ width: '80px', marginRight: 0 }} tabIndex={-1}>
              <Input
                color={!!deadlineError ? 'red' : undefined}
                onBlur={() => {
                  parseCustomDeadline((deadline / 60).toString())
                }}
                placeholder={(deadline / 60).toString()}
                value={deadlineInput}
                onChange={e => parseCustomDeadline(e.target.value)}
              />
            </OptionCustom>
            <MinutesText>minutes</MinutesText>
          </RowFixed>
        </SlippageWrapper>
      </AutoColumn>
    </AutoColumn>
  )
}

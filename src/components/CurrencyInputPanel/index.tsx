import { Currency, Pair, LPToken } from '@jediswap/sdk'
import React, { useState, useContext, useCallback } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { darken } from 'polished'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

import { useActiveStarknetReact } from '../../hooks'
import { useTranslation } from 'react-i18next'
import { ColumnCenter } from '../Column'
import { WrappedLPTokenInfo } from '../../state/lists/hooks'

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  min-width:130px;
  max-width: 132px;
  font-size: 12px;
  font-family: 'DM Sans', sans-serif;
   font-weight: 700;
  /* background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)}; */
  background: rgba(196, 196, 196, 0.01);
  /* color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)}; */
  color:${({ theme }) => theme.jediWhite};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  /* padding: 0 0.5rem; */

   /* :focus,
   :hover {
     background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
   } */
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  /* padding: 0.75rem 1rem 0 1rem; */
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.div<{ vertical?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: ${({ vertical }) => (vertical ? 'column' : 'row')};
  gap: ${({ vertical }) => (vertical ? '5px' : '0px')};
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  width: 16px;

  path {
    /* stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)}; */
    stroke: ${({ theme }) => theme.white};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  /* background-color: ${({ theme }) => theme.bg2}; */
  background: rgba(196, 196, 196, 0.01);
  z-index: 1;

`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  border: 1px solid ${({ theme }) => theme.bg2};

  background: transparent;
  background: rgba(196, 196, 196, 0.01);
  box-shadow: inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3),
    inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3),
    inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  border-radius: 8px;
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? 'margin: 0 4px 0 6px;' : 'margin: 0 7.5px 0 0;')}
  font-size: ${({ active }) => (active ? '17px' : '12px')};
  text-align: left;
  display: flex;
  align-items: center;
  white-space: nowrap;
 `

const StyledBalanceMax = styled.button`
  position: absolute;
  right: 13px;
  height: 28px;
  /* background-color: ${({ theme }) => theme.primary5}; */
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  border: 1px solid #FFFFFF;
  border-radius: 4px;
  font-weight: normal;
  font-size: 12px;
  line-height: 100%;
   padding: 6px 11px;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.jediWhite};
  :hover {
    border: 1px solid ${({ theme }) => theme.jediBlue};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
  showLPTokens?: boolean
  disableInput?: boolean
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  // hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  showLPTokens = false,
  disableInput = false
}: // customBalanceText
CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
  const { connectedAddress } = useActiveStarknetReact()
  const theme = useContext(ThemeContext)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const displayMaxButton = connectedAddress && currency && showMaxButton && label !== 'To'

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        {!hideInput && (
          <LabelRow>
            <RowBetween>
              <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                {label}
              </TYPE.body>
              {connectedAddress && (
                <TYPE.body
                  onClick={onMax}
                  color={theme.text2}
                  fontWeight={500}
                  fontSize={14}
                  style={{ display: 'inline', cursor: 'pointer' }}
                >
                  {/* {!hideBalance && !!currency && selectedCurrencyBalance
                    ? (customBalanceText ?? 'Balance: ') + selectedCurrencyBalance?.toSignificant(6)
                    : ' -'} */}
                </TYPE.body>
              )}
            </RowBetween>
          </LabelRow>
        )}
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
          <CurrencySelect
            selected={!!currency}
            className="open-currency-select-button"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner vertical={!!pair}>
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={25} />
              ) : currency ? (
                currency instanceof WrappedLPTokenInfo ? (
                  <DoubleCurrencyLogo currency0={currency.token0Info} currency1={currency.token1Info} size={25} />
                ) : (
                  <CurrencyLogo currency={currency} size={24} />
                )
              ) : null}
              {pair ? (
                <StyledTokenName className="pair-name-container" style={{ fontSize: '14px' }}>
                  {pair?.token0.symbol} : {pair?.token1.symbol}
                </StyledTokenName>
              ) : currency ? (
                currency instanceof LPToken ? (
                  <StyledTokenName active={Boolean(currency && currency.symbol)} style={{ fontSize: '14px' }}>
                    <ColumnCenter>
                      <div>{currency.token0.symbol}</div>
                      <div>/ {currency.token1.symbol}</div>
                    </ColumnCenter>
                  </StyledTokenName>
                ) : (
                  <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                    {currency && currency.symbol && currency.symbol.length > 20
                      ? currency.symbol.slice(0, 4) +
                        '...' +
                        currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                      : currency?.symbol}
                  </StyledTokenName>
                )
              ) : (
                <StyledTokenName className="token-symbol-container" active={false}>
                  {t('selectToken')}
                </StyledTokenName>
              )}
              {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
            </Aligner>
          </CurrencySelect>

          {!hideInput && (
            <>
              <NumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={val => {
                  onUserInput(val)
                }}
                style={displayMaxButton ? { paddingRight: '60px' } : { paddingRight: '12px' }}
                disabled={disableInput}
              />
              {displayMaxButton && <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>}
            </>
          )}
        </InputRow>
      </Container>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          showLPTokens={showLPTokens}
        />
      )}
    </InputPanel>
  )
}

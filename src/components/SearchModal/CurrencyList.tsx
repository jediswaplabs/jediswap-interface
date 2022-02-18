import { Currency, CurrencyAmount, currencyEquals, TOKEN0, Token, WTOKEN0, LPToken } from '@jediswap/sdk'
import React, { CSSProperties, MutableRefObject, useCallback, useEffect, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useActiveStarknetReact } from '../../hooks'
import { useSelectedTokenList, WrappedTokenInfo } from '../../state/lists/hooks'
import { useAddUserToken, useRemoveUserAddedToken } from '../../state/user/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { useIsUserAddedToken } from '../../hooks/Tokens'
import Column from '../Column'
import Row, { RowFixed } from '../Row'
import CurrencyLogo from '../CurrencyLogo'
import { MouseoverTooltip } from '../Tooltip'
import { FadedSpan, MenuItem } from './styleds'
import Loader from '../Loader'
import { isTokenOnList } from '../../utils'
import { PlusCircle } from 'react-feather'
import { ButtonEmpty } from '../Button'
import { ArgentXConnector } from '@web3-starknet-react/argentx-connector'
import { useAddTokenToWallet } from '../../hooks/useAddTokenToWallet'
import DoubleCurrencyLogo from '../DoubleLogo'

function currencyKey(currency: Currency): string {
  return currency instanceof Token ? currency.address : currency === TOKEN0 ? 'TOKEN0' : ''
}

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;

  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0px;
  font-weight: 500;
`

const Tag = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`

const StyledPlusCircle = styled(PlusCircle)`
  cursor: pointer;
  height: 18px;
  width: 18px;
`

function Balance({ balance }: { balance: CurrencyAmount }) {
  return (
    <StyledBalanceText title={balance.toSignificant(6)} color={'#FFFFFF'}>
      {balance.toSignificant(6)}
    </StyledBalanceText>
  )
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />
  }

  const tags = currency.tags
  if (!tags || tags.length === 0) return <span />

  const tag = tags[0]

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  )
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
}) {
  const { account, chainId, connector } = useActiveStarknetReact()
  const key = currencyKey(currency)
  const selectedTokenList = useSelectedTokenList()

  const isOnSelectedList = isTokenOnList(selectedTokenList, currency, chainId)
  const customAdded = useIsUserAddedToken(currency)
  const balance = useCurrencyBalance(account ?? undefined, currency)

  const removeToken = useRemoveUserAddedToken()
  const addToken = useAddUserToken()

  const addTokenToWallet = useAddTokenToWallet(connector)

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      {currency instanceof LPToken ? (
        <DoubleCurrencyLogo currency0={currency.token0} currency1={currency.token1} size={16} />
      ) : (
        <CurrencyLogo currency={currency} size={'16px'} />
      )}
      <Column>
        <Row gap="15px">
          <Text
            title={currency.name}
            fontWeight={700}
            fontSize={16}
            fontFamily={'DM Sans'}
            letterSpacing={'0px'}
            color={'#FFFFFF'}
            minWidth={'60px'}
          >
            {currency.symbol}
          </Text>

          <StyledPlusCircle
            onClick={() => {
              console.log('Add token')
              if (currency instanceof Token) {
                addTokenToWallet(currency.address)
              } else if (currency === TOKEN0) {
                addTokenToWallet(WTOKEN0[chainId ?? 5].address)
              }
            }}
          />
        </Row>
        <FadedSpan>
          {!isOnSelectedList && customAdded ? (
            <TYPE.main fontWeight={500}>
              Added by user
              <LinkStyledButton
                onClick={event => {
                  event.stopPropagation()
                  if (chainId && currency instanceof Token) removeToken(chainId, currency.address)
                }}
              >
                (Remove)
              </LinkStyledButton>
            </TYPE.main>
          ) : null}
          {!isOnSelectedList && !customAdded ? (
            <TYPE.main fontWeight={500}>
              Found by address
              <LinkStyledButton
                onClick={event => {
                  event.stopPropagation()
                  if (currency instanceof Token) addToken(currency)
                }}
              >
                (Add)
              </LinkStyledButton>
            </TYPE.main>
          ) : null}
        </FadedSpan>
      </Column>
      <TokenTags currency={currency} />
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {balance ? <Balance balance={balance} /> : account ? <Loader /> : null}
      </RowFixed>
    </MenuItem>
  )
}

export default function CurrencyList({
  height,
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showETH
}: {
  height: number
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showETH: boolean
}) {
  const itemData = useMemo(() => (showETH ? [Currency.TOKEN0, ...currencies] : currencies), [currencies, showETH])

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index]
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency))
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency))
      const handleSelect = () => onCurrencySelect(currency)
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      )
    },
    [onCurrencySelect, otherCurrency, selectedCurrency]
  )

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}

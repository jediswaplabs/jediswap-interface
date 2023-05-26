import { Contract, InvokeFunctionResponse, stark, Call, RawArgs } from 'starknet'
import { Currency, currencyEquals, ETHER, Percent, WETH } from '@jediswap/sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, Plus } from 'react-feather'
import { RouteComponentProps } from 'react-router'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonPrimary, ButtonLight, ButtonError } from '../../components/Button'
import { BlurCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { MinimalPositionCard } from '../../components/PositionCard'
import { RowBetween, RowFixed } from '../../components/Row'

import CurrencyLogo from '../../components/CurrencyLogo'
import { DEFAULT_CHAIN_ID, ROUTER_ADDRESS } from '../../constants'
import { useActiveStarknetReact } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { usePairContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { DMSansText, StyledInternalLink, TYPE } from '../../theme'
import { calculateGasMargin, calculateSlippageAmount } from '../../utils'
import { useRouterContract } from '../../hooks/useContract'
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import AppBody from '../AppBody'
import { ClickableText, MaxButton, Wrapper, PriceText } from '../Pool/styleds'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { Dots } from '../../components/swap/styleds'
import { useBurnActionHandlers } from '../../state/burn/hooks'
import { useDerivedBurnInfo, useBurnState } from '../../state/burn/hooks'
import { Field } from '../../state/burn/actions'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'

import { parsedAmountToUint256Args } from '../../utils'
import { useApprovalCall } from '../../hooks/useApproveCall'
import ModeSwitcher from './ModeSwitcher'
import { InputWrapper, StyledMaxButton, StyledNumericalInput, StyledPercentSign } from './styleds'
import PairPrice from '../../components/PairPrice'
import { useAccount } from '@starknet-react/core'

export default function RemoveLiquidity({
  history,
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library, connectedAddress } = useActiveStarknetReact()
  const { address } = useAccount()
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId
  ])

  const theme = useContext(ThemeContext)
  const router = useRouterContract()

  const [showInverted, setShowInverted] = useState<boolean>(false)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)

  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const deadline = useTransactionDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? ''
  }
  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  const approvalCallback = useApprovalCall(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID])

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      return !typedValue.includes('.') && _onUserInput(field, typedValue)
    },
    [_onUserInput]
  )

  const onLiquidityInput = useCallback((typedValue: string) => onUserInput(Field.LIQUIDITY, typedValue), [onUserInput])
  const onCurrencyAInput = useCallback((typedValue: string) => onUserInput(Field.CURRENCY_A, typedValue), [onUserInput])
  const onCurrencyBInput = useCallback((typedValue: string) => onUserInput(Field.CURRENCY_B, typedValue), [onUserInput])

  // tx sending
  const addTransaction = useTransactionAdder()
  async function onRemove() {
    if (!chainId || !library || !account || !deadline || !connectedAddress) throw new Error('missing dependencies')

    if (!router) return

    const approval = approvalCallback()

    if (!approval) return

    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    // const router = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0]
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB === ETHER
    const oneCurrencyIsETH = currencyA === ETHER || currencyBIsETH

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    const removeLiquidityArgs: RawArgs = {
      tokenA: wrappedCurrency(currencyA, chainId)?.address ?? '',
      tokenB: wrappedCurrency(currencyB, chainId)?.address ?? '',
      liquidity: parsedAmountToUint256Args(liquidityAmount.raw),
      amountAMin: parsedAmountToUint256Args(amountsMin[Field.CURRENCY_A]),
      amountBMin: parsedAmountToUint256Args(amountsMin[Field.CURRENCY_B]),
      to: connectedAddress,
      deadline: deadline.toHexString()
    }

    const removeLiquidityCalldata = stark.compileCalldata(removeLiquidityArgs)

    const removeLiquidityCall: Call = {
      contractAddress: router.address,
      entrypoint: 'remove_liquidity',
      calldata: removeLiquidityCalldata
    }

    setAttemptingTxn(true)

    await account
      .execute([approval, removeLiquidityCall])
      .then((response: InvokeFunctionResponse) => {
        setAttemptingTxn(false)

        addTransaction(response, {
          summary:
            'Remove ' +
            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
            ' ' +
            currencyA?.symbol +
            ' and ' +
            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
            ' ' +
            currencyB?.symbol
        })

        setTxHash(response.transaction_hash)
      })
      .catch((error: Error) => {
        setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        console.error(error)
      })
  }

  function modalHeader() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <RowBetween align="flex-end">
          <Text fontSize={24} fontWeight={500}>
            {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
          </Text>
          <RowFixed gap="4px">
            <CurrencyLogo currency={currencyA} size={25} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {currencyA?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowFixed>
          <Plus size="16" color={theme.text2} />
        </RowFixed>
        <RowBetween align="flex-end">
          <Text fontSize={24} fontWeight={500}>
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
          </Text>
          <RowFixed gap="4px">
            <CurrencyLogo currency={currencyB} size={25} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {currencyB?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>

        <DMSansText.body fontSize={14} textAlign="left" padding={'16px 0 12px'} lineHeight={'120%'}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
        </DMSansText.body>
      </AutoColumn>
    )
  }

  function modalBottom() {
    return (
      <>
        <RowBetween>
          <Text color={theme.jediWhite} fontWeight={500} fontSize={16}>
            {'MGP ' + currencyA?.symbol + '/' + currencyB?.symbol} Burned
          </Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin={true} />
            <Text fontWeight={500} fontSize={16}>
              {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <TYPE.body fontWeight={500}>Price</TYPE.body>
          {pair ? (
            <PairPrice
              pair={pair}
              showInverted={showInverted}
              setShowInverted={setShowInverted}
              style={{ fontWeight: '500', justifyContent: 'center', alignItems: 'center', display: 'flex' }}
            ></PairPrice>
          ) : (
            '-'
          )}
        </RowBetween>
        <ButtonPrimary onClick={onRemove} style={{ marginTop: '20px', marginBottom: '10px' }}>
          <Text>Confirm</Text>
        </ButtonPrimary>
      </>
    )
  }

  const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencyA?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.symbol}`

  const liquidityPercentChangeCallback = useCallback(
    (value: string) => {
      if (parseInt(value) <= 100 || value === '') {
        onUserInput(Field.LIQUIDITY_PERCENT, value)
      }
    },
    [onUserInput]
  )

  const oneCurrencyIsETH = currencyA === ETHER || currencyB === ETHER
  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WETH[chainId], currencyA)) ||
        (currencyB && currencyEquals(WETH[chainId], currencyB)))
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        history.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
      } else {
        history.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        history.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
      } else {
        history.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  // const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
  //   Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
  //   liquidityPercentChangeCallback
  // )

  const inputAmount =
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)) !== 0
      ? Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0))
      : ''

  return (
    <>
      <AppBody>
        <AddRemoveTabs creating={false} adding={false} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ''}
            content={() => (
              <ConfirmationModalContent
                title={'You will receive'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <AutoColumn gap="md">
            <BlurCard>
              <AutoColumn gap="20px">
                <RowBetween>
                  <DMSansText.largeHeader fontSize={18} fontWeight={700}>
                    AMOUNT
                  </DMSansText.largeHeader>

                  <ModeSwitcher
                    showDetailed={showDetailed}
                    onChange={() => {
                      setShowDetailed(!showDetailed)
                    }}
                  />
                </RowBetween>
                {/* <Row style={{ alignItems: 'flex-end' }}>
                  <Text fontSize={72} fontWeight={500}>
                    {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                  </Text>
                </Row> */}
                {showDetailed ? (
                  <DMSansText.largeHeader fontSize={30} fontWeight={700}>
                    {inputAmount === '' ? 0 : inputAmount}%
                  </DMSansText.largeHeader>
                ) : (
                  <>
                    {/* <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} /> */}
                    <InputWrapper>
                      <StyledNumericalInput
                        className="token-amount-input"
                        placeholder="0"
                        value={inputAmount}
                        onUserInput={liquidityPercentChangeCallback}
                      />
                      <StyledPercentSign>
                        <DMSansText.largeHeader fontSize={30} fontWeight={700}>
                          %
                        </DMSansText.largeHeader>
                      </StyledPercentSign>
                    </InputWrapper>
                    <RowBetween>
                      <StyledMaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')} width="20%">
                        25 %
                      </StyledMaxButton>
                      <StyledMaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')} width="20%">
                        50 %
                      </StyledMaxButton>
                      <StyledMaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')} width="20%">
                        75 %
                      </StyledMaxButton>
                      <StyledMaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')} width="20%">
                        MAX
                      </StyledMaxButton>
                    </RowBetween>
                  </>
                )}
              </AutoColumn>
            </BlurCard>
            {!showDetailed && (
              <>
                <ColumnCenter>
                  <ArrowDown size="16" color={theme.text2} />
                </ColumnCenter>
                <BlurCard>
                  <AutoColumn gap="10px">
                    <RowBetween>
                      <DMSansText.largeHeader>{formattedAmounts[Field.CURRENCY_A] || '-'}</DMSansText.largeHeader>
                      <RowFixed>
                        <CurrencyLogo currency={currencyA} style={{ marginRight: '10px' }} />
                        <DMSansText.largeHeader id="remove-liquidity-tokena-symbol">
                          {currencyA?.symbol}
                        </DMSansText.largeHeader>
                      </RowFixed>
                    </RowBetween>
                    <RowBetween>
                      <DMSansText.largeHeader>{formattedAmounts[Field.CURRENCY_B] || '-'}</DMSansText.largeHeader>
                      <RowFixed>
                        <CurrencyLogo currency={currencyB} style={{ marginRight: '10px' }} />
                        <DMSansText.largeHeader id="remove-liquidity-tokenb-symbol">
                          {currencyB?.symbol}
                        </DMSansText.largeHeader>
                      </RowFixed>
                    </RowBetween>
                    {/* {chainId && (oneCurrencyIsWETH || oneCurrencyIsETH) ? (
                      <RowBetween style={{ justifyContent: 'flex-end' }}>
                        {oneCurrencyIsETH ? (
                          <StyledInternalLink
                            to={`/remove/${currencyA === ETHER ? WETH[chainId].address : currencyIdA}/${
                              currencyB === ETHER ? WETH[chainId].address : currencyIdB
                            }`}
                          >
                            Receive WETH
                          </StyledInternalLink>
                        ) : oneCurrencyIsWETH ? (
                          <StyledInternalLink
                            to={`/remove/${
                              currencyA && currencyEquals(currencyA, WETH[chainId]) ? 'ETH' : currencyIdA
                            }/${currencyB && currencyEquals(currencyB, WETH[chainId]) ? 'ETH' : currencyIdB}`}
                          >
                            Receive ETHER
                          </StyledInternalLink>
                        ) : null}
                      </RowBetween>
                    ) : null} */}
                  </AutoColumn>
                </BlurCard>
              </>
            )}

            {showDetailed && (
              <>
                <CurrencyInputPanel
                  value={formattedAmounts[Field.LIQUIDITY]}
                  onUserInput={onLiquidityInput}
                  onMax={() => {
                    onUserInput(Field.LIQUIDITY_PERCENT, '100')
                  }}
                  showMaxButton={!atMaxAmount}
                  disableCurrencySelect
                  currency={pair?.liquidityToken}
                  pair={pair}
                  id="liquidity-amount"
                />
                <ColumnCenter>
                  <ArrowDown size="16" color={theme.text2} />
                </ColumnCenter>
                <CurrencyInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onCurrencyAInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyA}
                  onCurrencySelect={handleSelectCurrencyA}
                  id="remove-liquidity-tokena"
                />
                <ColumnCenter>
                  <Plus size="16" color={theme.text2} />
                </ColumnCenter>
                <CurrencyInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onCurrencyBInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyB}
                  onCurrencySelect={handleSelectCurrencyB}
                  id="remove-liquidity-tokenb"
                />
              </>
            )}
            {pair && (
              <DMSansText.body>
                <AutoColumn gap="7.5px" style={{ padding: '10px 0' }}>
                  <RowBetween>
                    Price
                    <PairPrice pair={pair} showInverted={showInverted} setShowInverted={setShowInverted} />
                  </RowBetween>
                </AutoColumn>
              </DMSansText.body>
            )}
            <div style={{ position: 'relative' }}>
              {!address ? (
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
              ) : (
                <RowBetween>
                  <ButtonError
                    onClick={() => {
                      setShowConfirm(true)
                    }}
                    disabled={!isValid}
                    error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                    style={{ padding: '22px 10px' }}
                  >
                    <Text>{error || 'Remove'}</Text>
                  </ButtonError>
                </RowBetween>
              )}
            </div>
          </AutoColumn>
        </Wrapper>
      </AppBody>

      {pair ? (
        <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
          <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
        </AutoColumn>
      ) : null}
    </>
  )
}

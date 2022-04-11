import { BigNumber } from '@ethersproject/bignumber'
import {
  Currency,
  CurrencyAmount,
  currencyEquals,
  JSBI,
  LPToken,
  Token,
  TOKEN0,
  TokenAmount,
  WTOKEN0
} from '@jediswap/sdk'
import React, { useCallback, useContext, useState } from 'react'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonGradient, ButtonLight, ButtonPrimary } from '../../components/Button'
import { BlueCard, LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row, { AutoRow, RowBetween, RowFixed, RowFlat } from '../../components/Row'

import { ROUTER_ADDRESS } from '../../constants'
import { PairState } from '../../data/Reserves'
import { useActiveStarknetReact } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { useIsExpertMode, useUserSlippageTolerance } from '../../state/user/hooks'
import { DMSansText, TYPE } from '../../theme'
import { calculateGasMargin, calculateSlippageAmount } from '../../utils'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import AppBody from '../AppBody'
import { Dots, Wrapper } from '../Pool/styleds'
import { ConfirmAddModalBottom } from './ConfirmAddModalBottom'
import { currencyId } from '../../utils/currencyId'
import { PoolPriceBar } from './PoolPriceBar'
import { useRouterContract } from '../../hooks/useContract'
import { AddTransactionResponse, Args, Call, RawArgs, stark, uint256 } from 'starknet'
import { parsedAmountToUint256Args } from '../../utils'

import styled from 'styled-components'
import { useApprovalCall } from '../../hooks/useApproveCall'
import { AddTokenRow, AddTokenText } from '../Swap/styleds'
import { useAddTokenToWallet } from '../../hooks/useAddTokenToWallet'
import { ReactComponent as ArrowRight } from '../../assets/images/arrow-right-blue.svg'

const BalanceText = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  text-align: center;
  color: ${({ theme }) => theme.jediWhite};
`

const Separator = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`
const HeaderNote = styled.div`
  padding: 10px 12px;
  font-family: 'DM Sans', sans-serif;
  font-weight: normal;
  font-size: 14px;
  line-height: 120%;
  color: ${({ theme }) => theme.jediWhite};
  background-color: ${({ theme }) => theme.jediNavyBlue};
  border-radius: 8px;
`
const LiquidityTokens = styled.div`
  font-size: 40px;
  font-weight: 700;
  line-height: 30px;
  margin-right: 16px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export default function AddLiquidity({
  match: {
    params: { currencyIdA, currencyIdB }
  },
  history
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const { account, chainId, library, connectedAddress } = useActiveStarknetReact()
  const theme = useContext(ThemeContext)

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  const routerContract = useRouterContract()

  const oneCurrencyIsWTOKEN0 = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WTOKEN0[chainId])) ||
        (currencyB && currencyEquals(currencyB, WTOKEN0[chainId])))
  )

  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const expertMode = useIsExpertMode()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const addTokenToWallet = useAddTokenToWallet()

  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field])
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0')
      }
    },
    {}
  )

  // check whether the user has approved the router on the tokens
  // const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS)
  // const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS)
  const approvalACallback = useApprovalCall(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS)
  const approvalBCallback = useApprovalCall(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS)

  const addTransaction = useTransactionAdder()

  async function onAdd() {
    if (!chainId || !library || !account || !connectedAddress) return

    const approvalA = approvalACallback()
    const approvalB = approvalBCallback()

    if (!approvalA || !approvalB) return

    const router = routerContract

    if (!router) return

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0]
    }

    // let estimate,

    // estimate = router.estimateGas.addLiquidity

    // args = [
    //   wrappedCurrency(currencyA, chainId)?.address ?? '',
    //   wrappedCurrency(currencyB, chainId)?.address ?? '',
    //   parsedAmountA.raw.toString(),
    //   parsedAmountB.raw.toString(),
    //   amountsMin[Field.CURRENCY_A].toString(),
    //   amountsMin[Field.CURRENCY_B].toString(),
    //   account,
    //   deadline.toHexString()
    // ]

    const args: RawArgs = {
      tokenA: wrappedCurrency(currencyA, chainId)?.address ?? '',
      tokenB: wrappedCurrency(currencyB, chainId)?.address ?? '',
      amountADesired: parsedAmountToUint256Args(parsedAmountA.raw),
      amountBDesired: parsedAmountToUint256Args(parsedAmountB.raw),
      amountAMin: parsedAmountToUint256Args(amountsMin[Field.CURRENCY_A]),
      amountBMin: parsedAmountToUint256Args(amountsMin[Field.CURRENCY_B]),
      to: connectedAddress,
      deadline: deadline.toHexString()
    }

    // value = null

    const calldata = stark.compileCalldata(args)

    const addLiquidityCall: Call = {
      contractAddress: router.address,
      entrypoint: 'add_liquidity',
      calldata
    }

    setAttemptingTxn(true)
    await account
      .execute([approvalA, approvalB, addLiquidityCall])
      .then(response => {
        setAttemptingTxn(false)

        addTransaction(response, {
          summary:
            'Add ' +
            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
            ' ' +
            currencies[Field.CURRENCY_A]?.symbol +
            ' and ' +
            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
            ' ' +
            currencies[Field.CURRENCY_B]?.symbol
        })

        setTxHash(response.transaction_hash)
      })
      .catch(error => {
        setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn gap="16px">
        <LightCard mt="20px" borderRadius="20px">
          <RowFlat>
            <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
              {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol}
            </Text>
            <div style={{ marginBottom: '1px' }}>
              <DoubleCurrencyLogo
                currency0={currencies[Field.CURRENCY_A]}
                currency1={currencies[Field.CURRENCY_B]}
                size={24}
              />
            </div>
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn gap="10px">
        <RowFlat style={{ marginTop: '16px' }}>
          <LiquidityTokens>{liquidityMinted?.toSignificant(6)}</LiquidityTokens>
          <div style={{ marginBottom: '1px' }}>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={24}
            />
          </div>
        </RowFlat>
        <Row>
          <Text fontSize="24px">
            {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol + ' Pool Tokens'}
          </Text>
        </Row>
        <DMSansText.body fontSize={14} textAlign="left" padding={'8px 0 0 0'} lineHeight={'120%'}>
          {`Output is estimated. If the price changes by more than ${allowedSlippage /
            100}% your transaction will revert.`}
        </DMSansText.body>
      </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        pair={pair}
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    )
  }

  const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA)
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/add/${currencyIdB}/${currencyIdA}`)
      } else {
        history.push(`/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, history, currencyIdA]
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          history.push(`/add/${newCurrencyIdB}`)
        }
      } else {
        history.push(`/add/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, history, currencyIdB]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const isCreate = history.location.pathname.includes('/create')

  return (
    <>
      <AppBody>
        <Wrapper>
          <AddRemoveTabs creating={isCreate} adding={true} />
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={() => (
              <ConfirmationModalContent
                title={noLiquidity ? 'You are creating a pool' : 'You will receive'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
                titleFont={{ family: 'DM Sans', size: 16, weight: 400, lineHeight: '20px', letterSpacing: '0px' }}
              />
            )}
            pendingText={pendingText}
          />
          <AutoColumn gap="16px">
            {noLiquidity ||
              (isCreate && (
                <ColumnCenter>
                  <BlueCard>
                    <AutoColumn gap="10px">
                      <TYPE.link fontWeight={600} color={'primaryText1'}>
                        You are the first liquidity provider.
                      </TYPE.link>
                      <TYPE.link fontWeight={400} color={'primaryText1'}>
                        The ratio of tokens you add will set the price of this pool.
                      </TYPE.link>
                      <TYPE.link fontWeight={400} color={'primaryText1'}>
                        Once you are happy with the rate click supply to review.
                      </TYPE.link>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ))}

            <HeaderNote>
              Note: When you add liquidity, you will receive pool tokens representing your position. These tokens
              automatically earn fees proportional to your share of the pool, and can be redeemed at any time.
            </HeaderNote>

            <AutoColumn gap="16px">
              <AutoRow justify="flex-end">
                <BalanceText>Balance: {currencyBalances.CURRENCY_A?.toSignificant(6) ?? 0}</BalanceText>
              </AutoRow>
              <CurrencyInputPanel
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={onFieldAInput}
                onMax={() => {
                  onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                }}
                onCurrencySelect={handleCurrencyASelect}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                currency={currencies[Field.CURRENCY_A]}
                id="add-liquidity-input-tokena"
              />
            </AutoColumn>

            <AutoRow justify="center" style={{ width: '50%', marginBottom: '-20px' }}>
              <Plus size="16" color={theme.jediWhite} />
            </AutoRow>

            <AutoColumn gap="16px">
              <AutoRow justify="flex-end">
                <BalanceText>Balance: {currencyBalances.CURRENCY_B?.toSignificant(6) ?? 0}</BalanceText>
              </AutoRow>
              <CurrencyInputPanel
                value={formattedAmounts[Field.CURRENCY_B]}
                onUserInput={onFieldBInput}
                onCurrencySelect={handleCurrencyBSelect}
                onMax={() => {
                  onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                }}
                showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                currency={currencies[Field.CURRENCY_B]}
                id="add-liquidity-input-tokenb"
              />
            </AutoColumn>
            {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState === PairState.EXISTS && (
              <>
                {pair && (
                  <LightCard padding="0px" borderRadius={'8px'}>
                    {/* <RowBetween padding="1rem">
                    <TYPE.subHeader fontWeight={500} fontSize={14} fontFamily={'DM Sans'} letterSpacing={'0ch'}>
                      {noLiquidity ? 'Initial prices' : 'Prices'} and Pool share
                    </TYPE.subHeader>
                  </RowBetween> */}
                    {/* <Separator /> */}
                    <LightCard padding={'10px 12px'}>
                      <PoolPriceBar
                        currencies={currencies}
                        poolTokenPercentage={poolTokenPercentage}
                        noLiquidity={noLiquidity}
                        price={price}
                        pair={pair}
                      />
                    </LightCard>
                  </LightCard>
                )}
              </>
            )}

            {!account ? (
              <ButtonGradient onClick={toggleWalletModal}>Connect Wallet</ButtonGradient>
            ) : (
              <AutoColumn gap={'md'}>
                <ButtonError
                  onClick={() => {
                    expertMode ? onAdd() : setShowConfirm(true)
                  }}
                  disabled={!isValid}
                  error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                >
                  <Text>{error ?? 'Supply'}</Text>
                </ButtonError>
              </AutoColumn>
            )}
          </AutoColumn>
          {account && pair && (
            <AddTokenRow justify={'center'} onClick={() => addTokenToWallet(pair.liquidityToken.address)}>
              <AddTokenText>Add LP Tokens to Wallet</AddTokenText>

              <ArrowRight width={16} height={15} style={{ marginBottom: '3.5px' }} />
            </AddTokenRow>
          )}
        </Wrapper>
      </AppBody>

      {pair && !noLiquidity && pairState !== PairState.INVALID ? (
        <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '468px', marginTop: '24px' }}>
          <MinimalPositionCard showUnwrapped={oneCurrencyIsWTOKEN0} pair={pair} />
        </AutoColumn>
      ) : null}
    </>
  )
}

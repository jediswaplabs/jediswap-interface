import React, { Suspense, useEffect, lazy } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../components/Header'
import Popups from '../components/Popups'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Footer from '../components/Footer'
import useFetchAllPairsCallback from '../hooks/useFetchAllPairs'
import { MainnetWarningModal } from '../components/MainnetWarningModal'
import { Web3ReactProvider } from '@web3-react/core'
import { isProductionChainId, isProductionEnvironment, isTestnetChainId, isTestnetEnvironment } from '../connectors'
import { useAccount, useConnectors } from '@starknet-react/core'
import { StarknetChainId } from 'starknet/dist/constants'
import { useAccountDetails } from '../hooks'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const Swap = lazy(() => import('./Swap'))
const Pool = lazy(() => import('./Pool'))
const Zap = lazy(() => import('./Zap'))
const ComingSoon = lazy(() => import('./ComingSoon'))
const RemoveLiquidity = lazy(() => import('./RemoveLiquidity'))

const RedirectPathToSwapOnly = lazy(() =>
  import('./Swap/redirects').then(module => ({ default: module.RedirectPathToSwapOnly }))
)

const RedirectToSwap = lazy(() => import('./Swap/redirects').then(module => ({ default: module.RedirectToSwap })))

const RedirectToAddLiquidity = lazy(() =>
  import('./AddLiquidity/redirects').then(module => ({ default: module.RedirectToAddLiquidity }))
)
const RedirectOldAddLiquidityPathStructure = lazy(() =>
  import('./AddLiquidity/redirects').then(module => ({ default: module.RedirectOldAddLiquidityPathStructure }))
)
const RedirectDuplicateTokenIds = lazy(() =>
  import('./AddLiquidity/redirects').then(module => ({ default: module.RedirectDuplicateTokenIds }))
)

export default function App() {
  const fetchAllPairs = useFetchAllPairsCallback()
  const { disconnect } = useConnectors()
  const { status, chainId } = useAccountDetails()

  useEffect(() => {
    fetchAllPairs()
  }, [fetchAllPairs])

  useEffect(() => {
    //Ensure that environment and chainId are compatible with one another.
    if (status === 'connected' && chainId) {
      if (
        (isProductionEnvironment() && !isProductionChainId(chainId)) ||
        (isTestnetEnvironment() && !isTestnetChainId(chainId)) ||
        !Object.values(StarknetChainId).includes(chainId)
      ) {
        disconnect()
      }
    }
  }, [status])

  return (
    <Suspense fallback={null}>
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper>
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <BodyWrapper>
          <Popups />
          <MainnetWarningModal />

          <Web3ReactProvider getLibrary={web3 => web3}>
            <Suspense fallback={'Loading...'}>
              <Switch>
                <Route exact strict path="/swap" component={Swap} />
                <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
                <Route exact strict path="/pool" component={Pool} />
                <Route exact path="/add" component={RedirectToAddLiquidity} />
                <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                <Route exact path="/create" component={RedirectToAddLiquidity} />
                <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                <Route exact path="/zap" component={Zap} />
                {/* <Route exact path="/bridge" component={Bridge} /> */}
                <Route exact path="/stake" component={ComingSoon} />
                <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                <Route component={RedirectPathToSwapOnly} />
              </Switch>
            </Suspense>
          </Web3ReactProvider>
          <Marginer />
        </BodyWrapper>
        <Footer />
      </AppWrapper>
    </Suspense>
  )
}

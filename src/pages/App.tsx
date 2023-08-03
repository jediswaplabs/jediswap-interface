import React, { Suspense, useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../components/Header'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'

import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'

import Pool from './Pool'

import RemoveLiquidity from './RemoveLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity
} from './AddLiquidity/redirects'

import Zap from './Zap'
import ComingSoon from './ComingSoon'
import Maintenance from './Maintenance'
import Footer from '../components/Footer'
import useFetchAllPairsCallback from '../hooks/useFetchAllPairs'
import { MainnetWarningModal } from '../components/MainnetWarningModal'
import { Web3ReactProvider } from '@web3-react/core'
import Bridge from './Bridge'
import { isProductionEnvironment, isStagingEnvironment } from '../connectors'

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

export default function App() {
  const fetchAllPairs = useFetchAllPairsCallback()

  useEffect(() => {
    fetchAllPairs()
  }, [fetchAllPairs])

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

          <Web3ReactManager>
            <Web3ReactProvider getLibrary={web3 => web3}>
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
            </Web3ReactProvider>
          </Web3ReactManager>
          <Marginer />
        </BodyWrapper>
        <Footer />
      </AppWrapper>
    </Suspense>
  )
}

// import { createWeb3ReactRoot, Web3ReactProvider } from 'web3-starknet-react'
import 'inter-ui'
import React, { StrictMode } from 'react'
import { isMobile } from 'react-device-detect'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga4'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { NetworkContextName } from './constants'
import './i18n'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'
import getLibrary from './utils/getLibrary'
import { Connector } from '@starknet-react/core'
import { StarknetConfig, publicProvider, argent, braavos, useInjectedConnectors } from '@starknet-react/core'
import { StarknetReactProvider, createStarknetReactRoot } from '@web3-starknet-react/core'
import './components/analytics'
import { WebWalletConnector } from '@argent/starknet-react-webwallet-connector'
import { isTestnetEnvironment } from './connectors'
import { StarknetProvider } from './context/StarknetProvider'
import { ApolloProvider } from 'react-apollo'
import { jediSwapClient } from './apollo/client'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <StarknetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={jediSwapClient}>
            <Updaters />
            <ThemeProvider>
              <ThemedGlobalStyle />
              <HashRouter>
                <App />
              </HashRouter>
            </ThemeProvider>
          </ApolloProvider>
        </QueryClientProvider>
      </Provider>
    </StarknetProvider>
  </StrictMode>,
  document.getElementById('root')
)

// import { createWeb3ReactRoot, Web3ReactProvider } from 'web3-starknet-react'
import 'inter-ui'
import React, { StrictMode } from 'react'
import { isMobile } from 'react-device-detect'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga4'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
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
import { StarknetReactProvider, createStarknetReactRoot } from '@web3-starknet-react/core'
import { StarknetConfig, InjectedConnector } from '@starknet-react/core'

import './components/analytics'

const StarknetProviderNetwork = createStarknetReactRoot(NetworkContextName)
const connectors = [
  new InjectedConnector({ options: { id: 'braavos' } }),
  new InjectedConnector({ options: { id: 'argentX' } })
]

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
    <StarknetConfig connectors={connectors}>
      <StarknetReactProvider getLibrary={getLibrary}>
        <StarknetProviderNetwork getLibrary={getLibrary}>
          <Provider store={store}>
            <Updaters />
            <ThemeProvider>
              <ThemedGlobalStyle />
              <HashRouter>
                <App />
              </HashRouter>
            </ThemeProvider>
          </Provider>
        </StarknetProviderNetwork>
      </StarknetReactProvider>
    </StarknetConfig>
  </StrictMode>,
  document.getElementById('root')
)

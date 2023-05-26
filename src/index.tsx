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
import { StarknetConfig } from '@starknet-react/core'

import './components/analytics'
import { argentX, braavosWallet } from './connectors'

const StarknetProviderNetwork = createStarknetReactRoot(NetworkContextName)

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
    <StarknetConfig connectors={[argentX, braavosWallet]}>
      <Provider store={store}>
        <Updaters />
        <ThemeProvider>
          <ThemedGlobalStyle />
          <HashRouter>
            <App />
          </HashRouter>
        </ThemeProvider>
      </Provider>
    </StarknetConfig>
  </StrictMode>,
  document.getElementById('root')
)

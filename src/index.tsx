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
import { InjectedConnector, StarknetConfig } from '@starknet-react/core'
import { StarknetReactProvider, createStarknetReactRoot } from '@web3-starknet-react/core'

import './components/analytics'
import { WebWalletConnector } from '@argent/starknet-react-webwallet-connector'
import { isTestnetEnvironment } from './connectors'
console.log(isTestnetEnvironment(), 'this is testnet')
const connectors = [
  new InjectedConnector({ options: { id: 'argentX' } }),
  new InjectedConnector({ options: { id: 'braavos' } }),
  new WebWalletConnector({
    url: isTestnetEnvironment() ? 'https://web.hydrogen.argent47.net/' : 'https://web.argent.xyz/'
  })
]

const StarknetProviderNetwork = createStarknetReactRoot(NetworkContextName)

Sentry.init({
  dsn: 'https://6911d3472d9a467b962b9a4b2848abc6@o4505240445911040.ingest.sentry.io/4505240447287296',
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  release: `${process.env.NPM_PACKAGE_VERSION}`,
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

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
    <StarknetReactProvider getLibrary={getLibrary}>
      <StarknetProviderNetwork getLibrary={getLibrary}>
        <StarknetConfig connectors={connectors as any}>
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
      </StarknetProviderNetwork>
    </StarknetReactProvider>
  </StrictMode>,
  document.getElementById('root')
)

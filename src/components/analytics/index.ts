import ReactGA from 'react-ga4'
import { isMobile } from 'react-device-detect'

export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'
const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID

const storedClientId = window.localStorage.getItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY)

if (typeof GOOGLE_ANALYTICS_ID === 'string') {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID, {
    gaOptions: {
      storage: 'none',
      storeGac: false,
      clientId: storedClientId ?? undefined
    }
  })
  ReactGA.set({
    anonymizeIp: true,
    customBrowserType: !isMobile ? 'desktop' : 'starknet' in window ? 'mobileStarknet' : 'mobileRegular'
  })
} else {
  ReactGA.initialize('test', { gtagOptions: { debug_mode: true } })
}

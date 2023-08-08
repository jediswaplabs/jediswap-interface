import { useEffect } from 'react'
import ReactGA from 'react-ga4'
import { RouteComponentProps } from 'react-router-dom'
import { GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY } from './index'
import { useAccountDetails } from '../../hooks'

// fires a GA pageview every time the route changes
export default function GoogleAnalyticsReporter({ location: { pathname, search } }: RouteComponentProps): null {
  const { account, chainId } = useAccountDetails()
  useEffect(() => {
    // cd1 - custom dimension 1 - chainId
    ReactGA.set({ cd1: chainId ?? 0 })
  }, [chainId])

  useEffect(() => {
    ReactGA.pageview(`${pathname}${search}`)
  }, [pathname, search])

  useEffect(() => {
    // typed as 'any' in react-ga4 -.-
    ReactGA.ga((tracker: any) => {
      if (!tracker) return

      const clientId = tracker.get('clientId')
      window.localStorage.setItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY, clientId)
    })
  }, [])
  return null
}

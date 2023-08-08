import { isStagingEnvironment, isTestnetEnvironment } from '../connectors'

const getDefaultTokensListUrl = () => {
  const getUrl = (env = '', name = 'jediswap-default.tokenlist.json') =>
    `https://static.${env ? `${env}.` : ''}jediswap.xyz/tokens-list/${name}`

  if (isStagingEnvironment()) {
    return getUrl('staging')
  }

  if (isTestnetEnvironment()) {
    return getUrl('testnet')
  }

  return getUrl()
}

export const DEFAULT_TOKEN_LIST_URL = getDefaultTokensListUrl()

export const DEFAULT_LIST_OF_LISTS: string[] = [DEFAULT_TOKEN_LIST_URL, 'ipns://tokens.jediswap.xyz']

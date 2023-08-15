import { validateAndParseAddress, constants } from 'starknet'
import { JSBI, Percent, Token, WETH } from '@jediswap/sdk'
import { StarknetChainId } from 'starknet/dist/constants'

// import { fortmatic, injected, portis, walletconnect, walletlink, argentX } from '../connectors'
import { argentX, braavosWallet, argentWebWallet } from '../connectors'
import ARGENTX_ICON from '../assets/images/argentx.png'
import EMAIL_ICON from '../assets/images/mail.png'
import BRAAVOS_ICON from '../assets/svg/Braavos.svg'
import { InjectedConnector } from '@starknet-react/core'
import { WebWalletConnector } from '@argent/starknet-react-webwallet-connector'

export const DEFAULT_CHAIN_ID = StarknetChainId.MAINNET

export const domainURL = (chainId: StarknetChainId) => {
  return chainId === StarknetChainId.MAINNET
    ? 'https://app.starknet.id/api/indexer/addr_to_domain?addr='
    : 'https://goerli.app.starknet.id/api/indexer/addr_to_domain?addr='
}

export const ROUTER_ADDRESS: { [chainId in StarknetChainId]: string } = {
  [StarknetChainId.MAINNET]: validateAndParseAddress(
    '0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023'
  ),
  [StarknetChainId.TESTNET]: validateAndParseAddress(
    '0x2bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965'
  )
}

export const ZAP_IN_ADDRESS: { [chainId in StarknetChainId]: string } = {
  [StarknetChainId.MAINNET]: validateAndParseAddress(
    '0x29a303b928b9391ce797ec27d011d3937054bee783ca7831df792bae00c925c'
  ),
  [StarknetChainId.TESTNET]: validateAndParseAddress(
    '0x73e3ccd627283aed4fa3940aa2bdb4d2c702e8e44c99b6851c019222558310f'
  )
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in StarknetChainId]: Token[]
}

export const DAI = {
  [StarknetChainId.TESTNET]: new Token(
    StarknetChainId.TESTNET,
    '0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9',
    18,
    'DAI',
    'Dai Stablecoin',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png'
  ),
  [StarknetChainId.MAINNET]: new Token(
    StarknetChainId.MAINNET,
    '0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3',
    18,
    'DAI',
    'Dai Stablecoin',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png'
  )
}
export const USDC = {
  [StarknetChainId.TESTNET]: new Token(
    StarknetChainId.TESTNET,
    '0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426',
    6,
    'USDC',
    'USD//C',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
  ),
  [StarknetChainId.MAINNET]: new Token(
    StarknetChainId.MAINNET,
    '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    6,
    'USDC',
    'USD//C',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
  )
}

export const USDT = {
  [StarknetChainId.TESTNET]: new Token(
    StarknetChainId.TESTNET,
    '0x386e8d061177f19b3b485c20e31137e6f6bc497cc635ccdfcab96fadf5add6a',
    6,
    'USDT',
    'Tether USD',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
  ),
  [StarknetChainId.MAINNET]: new Token(
    StarknetChainId.MAINNET,
    '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
    6,
    'USDT',
    'Tether USD',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
  )
}

export const WBTC = {
  [StarknetChainId.TESTNET]: new Token(
    StarknetChainId.TESTNET,
    '0x12D537dC323c439DC65c976FAD242D5610D27cFb5f31689A0A319B8be7F3D56',
    8,
    'WBTC',
    'Wrapped BTC',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png'
  ),
  [StarknetChainId.MAINNET]: new Token(
    StarknetChainId.MAINNET,
    '0x03fe2B97c1Fd336e750087d68B9B867997Fd64a2661fF3CA5a7C771641E8e7Ac',
    8,
    'WBTC',
    'Wrapped BTC',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png'
  )
}

export const wstETH = {
  [StarknetChainId.TESTNET]: new Token(
    StarknetChainId.TESTNET,
    '0x12D537dC323c439DC65c976FAD242D5610D27cFb5f31689A0A319B8be7F3D56',
    18,
    'USDT',
    'Tether USD',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
  ),
  [StarknetChainId.MAINNET]: new Token(
    StarknetChainId.MAINNET,
    '0x042b8F0484674Ca266ac5D08E4ac6A3fE65bd3129795def2dCA5c34ecc5f96d2',
    18,
    'wstETH',
    'Wrapped stETH',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32/logo.png'
  )
}

// export const USDT = new Token(StarknetChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
// export const COMP = new Token(StarknetChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
// export const MKR = new Token(StarknetChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
// export const AMPL = new Token(StarknetChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
// export const WBTC = new Token(StarknetChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 18, 'WBTC', 'Wrapped BTC')

// TODO this is only approximate, it's actually based on blocks
export const PROPOSAL_LENGTH_IN_DAYS = 7

const WETH_ONLY: ChainTokenList = {
  [StarknetChainId.MAINNET]: [WETH[StarknetChainId.MAINNET]],
  [StarknetChainId.TESTNET]: [WETH[StarknetChainId.TESTNET]]
}

// const TOKEN0_ONLY: ChainTokenList = {
//   [StarknetChainId.TESTNET]: [TOKEN0],
//   [StarknetChainId.MAINNET]: [TOKEN0],
//   [StarknetChainId.KOVAN]: [TOKEN0],
//   [StarknetChainId.ROPSTEN]: [TOKEN0],
//   [StarknetChainId.RINKEBY]: [TOKEN0]
// }

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [StarknetChainId.TESTNET]: [
    ...WETH_ONLY[StarknetChainId.TESTNET],
    DAI[StarknetChainId.TESTNET],
    USDC[StarknetChainId.TESTNET],
    USDT[StarknetChainId.TESTNET]
  ],
  [StarknetChainId.MAINNET]: [
    ...WETH_ONLY[StarknetChainId.MAINNET],
    DAI[StarknetChainId.MAINNET],
    USDC[StarknetChainId.MAINNET],
    USDT[StarknetChainId.MAINNET]
  ]
  // [StarknetChainId.TESTNET]: [TOKEN0]
  // [StarknetChainId.MAINNET]: [TOKEN0, TOKEN1],
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
// export const CUSTOM_BASES: { [chainId in StarknetChainId]?: { [tokenAddress: string]: Token[] } } = {
//   [StarknetChainId.MAINNET]: {
//     [AMPL.address]: [DAI, WETH[StarknetChainId.MAINNET]]
//   }
// }

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [StarknetChainId.TESTNET]: [
    ...WETH_ONLY[StarknetChainId.TESTNET],
    DAI[StarknetChainId.TESTNET],
    USDC[StarknetChainId.TESTNET],
    USDT[StarknetChainId.TESTNET]
  ],
  [StarknetChainId.MAINNET]: [
    ...WETH_ONLY[StarknetChainId.MAINNET],
    DAI[StarknetChainId.MAINNET],
    USDC[StarknetChainId.MAINNET],
    USDT[StarknetChainId.MAINNET]
  ]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [StarknetChainId.TESTNET]: [
    ...WETH_ONLY[StarknetChainId.TESTNET],
    DAI[StarknetChainId.TESTNET],
    USDC[StarknetChainId.TESTNET],
    USDT[StarknetChainId.TESTNET]
    // WBTC[StarknetChainId.TESTNET],
    // wstETH[StarknetChainId.TESTNET]
  ],
  [StarknetChainId.MAINNET]: [
    ...WETH_ONLY[StarknetChainId.MAINNET],
    DAI[StarknetChainId.MAINNET],
    USDC[StarknetChainId.MAINNET],
    USDT[StarknetChainId.MAINNET],
    WBTC[StarknetChainId.MAINNET],
    wstETH[StarknetChainId.MAINNET]
  ]
}

export const BASES_TO_BUILD_ZAPPER_LIST_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [StarknetChainId.TESTNET]: [
    ...WETH_ONLY[StarknetChainId.TESTNET],
    DAI[StarknetChainId.TESTNET],
    USDC[StarknetChainId.TESTNET],
    USDT[StarknetChainId.TESTNET]
    // WBTC[StarknetChainId.TESTNET],
    // wstETH[StarknetChainId.TESTNET]
  ],
  [StarknetChainId.MAINNET]: [
    ...WETH_ONLY[StarknetChainId.MAINNET],
    DAI[StarknetChainId.MAINNET],
    USDC[StarknetChainId.MAINNET],
    USDT[StarknetChainId.MAINNET],
    WBTC[StarknetChainId.MAINNET],
    wstETH[StarknetChainId.MAINNET]
  ]
}

export const PINNED_PAIRS: { readonly [chainId in StarknetChainId]?: [Token, Token][] } = {
  [StarknetChainId.TESTNET]: [
    [WETH[StarknetChainId.TESTNET], DAI[StarknetChainId.TESTNET]],
    [WETH[StarknetChainId.TESTNET], USDC[StarknetChainId.TESTNET]]
  ],
  [StarknetChainId.MAINNET]: [
    [WETH[StarknetChainId.MAINNET], DAI[StarknetChainId.MAINNET]],
    [WETH[StarknetChainId.MAINNET], USDC[StarknetChainId.MAINNET]]
  ]
}

export interface WalletInfo {
  connector?: InjectedConnector | WebWalletConnector
  name: string
  icon: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
  size?: number
  id: string
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  argentX: {
    connector: argentX,
    name: 'Argent-X',
    icon: ARGENTX_ICON,
    description: 'Starknet Browser Wallet',
    href: null,
    color: '#FF875B',
    mobile: true,
    id: 'argentX'
  },
  // argentWebWallet: {
  //   connector: argentWebWallet,
  //   name: 'Continue with email',
  //   icon: EMAIL_ICON,
  //   description: 'Starknet Browser Wallet',
  //   href: null,
  //   color: '#FF875B',
  //   mobile: true,
  //   id: 'argentWebWallet'
  // },
  braavos: {
    connector: braavosWallet,
    name: 'Braavos',
    icon: BRAAVOS_ICON,
    description: 'Braavos Wallet for Starknet',
    href: null,
    color: '#E0B137',
    size: 30,
    mobile: true,
    id: 'braavos'
  }

  // INJECTED: {
  //   connector: injected,
  //   name: 'Injected',
  //   iconName: 'arrow-right.svg',
  //   description: 'Injected web3 provider.',
  //   href: null,
  //   color: '#010101',
  //   primary: true
  // },
  // METAMASK: {
  //   connector: injected,
  //   name: 'MetaMask',
  //   iconName: 'metamask.png',
  //   description: 'Easy-to-use browser extension.',
  //   href: null,
  //   color: '#E8831D'
  // },
  // WALLET_CONNECT: {
  //   connector: walletconnect,
  //   name: 'WalletConnect',
  //   iconName: 'walletConnectIcon.svg',
  //   description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
  //   href: null,
  //   color: '#4196FC',
  //   mobile: true
  // },
  // WALLET_LINK: {
  //   connector: walletlink,
  //   name: 'Coinbase Wallet',
  //   iconName: 'coinbaseWalletIcon.svg',
  //   description: 'Use Coinbase Wallet app on mobile device',
  //   href: null,
  //   color: '#315CF5'
  // },
  // COINBASE_LINK: {
  //   name: 'Open in Coinbase Wallet',
  //   iconName: 'coinbaseWalletIcon.svg',
  //   description: 'Open in Coinbase Wallet app.',
  //   href: 'https://go.cb-w.com/mtUDhEZPy1',
  //   color: '#315CF5',
  //   mobile: true,
  //   mobileOnly: true
  // },
  // FORTMATIC: {
  //   connector: fortmatic,
  //   name: 'Fortmatic',
  //   iconName: 'fortmaticIcon.png',
  //   description: 'Login using Fortmatic hosted wallet',
  //   href: null,
  //   color: '#6748FF',
  //   mobile: true
  // },
  // Portis: {
  //   connector: portis,
  //   name: 'Portis',
  //   iconName: 'portisIcon.png',
  //   description: 'Login using Portis hosted wallet',
  //   href: null,
  //   color: '#4A6C9B',
  //   mobile: true
  // },
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 200
// 60 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 60

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))

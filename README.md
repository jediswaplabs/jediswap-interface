# Jediswap Interface

[![Lint](https://github.com/Jediswap/uniswap-interface/workflows/Lint/badge.svg)](https://github.com/Jediswap/uniswap-interface/actions?query=workflow%3ALint)
[![Tests](https://github.com/Jediswap/uniswap-interface/workflows/Tests/badge.svg)](https://github.com/Jediswap/uniswap-interface/actions?query=workflow%3ATests)
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An open source interface for Jediswap -- a protocol for decentralized exchange of Ethereum tokens.

- Website: [jediswap.org](https://jediswap.org/)
- Interface: [app.testnet.jediswap.xyz](https://app.testnet.jediswap.xyz/)
- Docs: [jediswap.org/docs/](https://jediswap.org/docs/)
- Twitter: [@JediswapProtocol](https://twitter.com/JediswapProtocol)
- Reddit: [/r/Jediswap](https://www.reddit.com/r/Jediswap/)
- Email: [contact@jediswap.org](mailto:contact@jediswap.org)
- Discord: [Jediswap](https://discord.gg/Y7TF6QA)
- Whitepaper: [Link](https://hackmd.io/C-DvwDSfSxuh-Gd4WKE_ig)

## Accessing the Jediswap Interface

To access the Jediswap Interface, use an IPFS gateway link from the
[latest release](https://github.com/Jediswap/uniswap-interface/releases/latest),
or visit [app.testnet.jediswap.xyz](https://app.testnet.jediswap.xyz/).

## Listing a token

Please see the
[@jediswap/default-token-list](https://github.com/jediswap/default-token-list)
repository.

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn dev
```

### Configuring the environment (optional)

To have the interface default to a different network when a wallet is not connected:

1. Make a copy of `.env` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to e.g. `"https://{YOUR_NETWORK_ID}.infura.io/v3/{YOUR_INFURA_KEY}"`

Note that the interface only works on testnets where both
[Jediswap V2](https://uniswap.org/docs/v2/smart-contracts/factory/) and
[multicall](https://github.com/makerdao/multicall) are deployed.
The interface will not work on other networks.

## Contributions

**Please open all pull requests against the `jedi-staging` branch.**
CI checks will run against all PRs.

## Accessing Jediswap Interface V1

The Jediswap Interface supports swapping against, and migrating or removing liquidity from Jediswap V1. However,
if you would like to use Jediswap V1, the Jediswap V1 interface for mainnet and testnets is accessible via IPFS gateways
linked from the [v1.0.0 release](https://github.com/Jediswap/uniswap-interface/releases/tag/v1.0.0).

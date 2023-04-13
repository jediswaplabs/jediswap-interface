import React, { useCallback, useContext, useEffect, useState } from 'react'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { BodyWrapper } from '../AppBody'

import { Backdrop, HeaderRow } from '../Swap/styleds'
import { useActiveStarknetReact } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { darkTheme, WidoWidget, isStarknetChain } from 'wido-widget'
import styled, { ThemeContext } from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { AutoColumn } from '../../components/Column'
import ZapIcon from '../../assets/jedi/zap.svg'
import { Header, HeaderInfo } from './styleds'
import { getSupportedTokens } from 'wido'
import { ChainId } from '@jediswap/sdk'
import { providers } from 'ethers'
import { useJediLPTokens } from '../../hooks/Tokens'
import { isAddress } from '../../utils'

export const StyledAppBody = styled(BodyWrapper)`
  padding: 0rem;
`
export const injected = new InjectedConnector({})

export default function Zap() {
  const theme = useContext(ThemeContext)
  /**
   * Starknet wallet connection
   */
  const { chainId: snChainId, account: snAccount, connectedAddress, library: snLibrary } = useActiveStarknetReact()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const [passedAccount, setPassedAccount] = useState(snAccount ?? undefined)

  // Work-around: unfortunately account.chainId does not get updated when the user changes network
  // Solution: re-create the account object each time chainId or account changes
  console.log('📜 LOG > Zap > account?.chainId:', snAccount?.chainId)
  useEffect(() => {
    if (!snAccount || !snLibrary || !connectedAddress) {
      setPassedAccount(undefined)
    } else {
      setPassedAccount(snAccount)
      // setPassedAccount(new Account(library, connectedAddress, account.signer))
    }
  }, [snLibrary, snAccount, snChainId, connectedAddress, setPassedAccount])

  /**
   * Ethereum wallet connection
   */
  const { library, chainId, account, activate, deactivate } = useWeb3React()
  const [ethProvider, setEthProvider] = useState<providers.Web3Provider | undefined>()
  useEffect(() => {
    if (!library) return
    // every time account or chainId changes we need to re-create the provider
    // for the widget to update with the proper address
    setEthProvider(new providers.Web3Provider(library))
  }, [library, account, chainId, setEthProvider])
  const handleMetamask = useCallback(async () => {
    if (ethProvider) {
      deactivate()
    } else {
      await activate(injected)
    }
  }, [ethProvider, activate, deactivate])

  const handleConnectWalletClick = useCallback(
    (chainId: number) => {
      if (isStarknetChain(chainId)) {
        toggleWalletModal()
      } else {
        handleMetamask()
      }
    },
    [toggleWalletModal, handleMetamask]
  )

  const [fromTokens, setFromTokens] = useState<{ chainId: number; address: string }[]>([])
  const [toTokens, setToTokens] = useState<{ chainId: number; address: string }[]>([])
  const lpTokens = useJediLPTokens()

  useEffect(() => {
    if (!snChainId || snChainId === ChainId.MAINNET) {
      setFromTokens([
        {
          chainId: 15366,
          address: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
          // name: 'Ether',
        },
        {
          chainId: 15366,
          address: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8'
          // name: 'USD Coin',
        },
        {
          chainId: 15366,
          address: '0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3'
          // name: 'Dai Stablecoin',
        },
        {
          chainId: 15366,
          address: '0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac'
          // name: 'Wrapped BTC',
        },
        {
          chainId: 15366,
          address: '0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8'
          // name: 'Tether USD'
        },
        {
          chainId: 1,
          address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
          // name: 'Ether',
        },
        {
          chainId: 1,
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
          // name: 'Dai Stablecoin',
        },
        {
          chainId: 1,
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
          // name: 'Wrapped BTC',
        },
        {
          chainId: 1,
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
          // name: 'Tether USD'
        },
        {
          chainId: 1,
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
          // name: 'USD Coin'
        }
      ])
      getSupportedTokens({ chainId: [15366], protocol: ['jediswap.xyz'] }).then(tokens => {
        setToTokens(
          tokens.filter(token => {
            const formattedToken = isAddress(token.address)
            if (formattedToken == false) {
              return false
            }
            return formattedToken in lpTokens
          })
        )
      })
    } else {
      setFromTokens([
        {
          chainId: 15367,
          address: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
          // name: 'Ether',
        },
        {
          chainId: 15367,
          address: '0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426'
          // name: 'Goerli USD Coin',
        },
        {
          chainId: 15367,
          address: '0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9'
          // "name": "Dai Stablecoin",
        },
        {
          chainId: 15367,
          address: '0x12d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56'
          // "name": "Wrapped BTC",
        },
        {
          address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          chainId: 5
          // name: 'ETH',
        }
      ])
      getSupportedTokens({ chainId: [15367], protocol: ['jediswap.xyz'] }).then(tokens => {
        setToTokens(
          tokens.filter(token => {
            const formattedToken = isAddress(token.address)
            if (formattedToken == false) {
              return false
            }
            return formattedToken in lpTokens
          })
        )
      })
    }
  }, [snChainId, setToTokens])

  return (
    <>
      <AutoColumn gap="14px" style={{ maxWidth: 470, padding: '2rem' }}>
        <HeaderRow>
          <Header>
            ZAP <img src={ZapIcon} />
          </Header>
        </HeaderRow>
        <HeaderInfo fontSize={16}>
          Zap helps you convert any of your tokens into LP tokens with 1-click. Thanks to Wido, it also supports tokens
          on Ethereum!
        </HeaderInfo>
      </AutoColumn>
      <StyledAppBody>
        <Backdrop top={'0'} left={'503px'} curveRight />
        <Backdrop top={'30px'} left={'493px'} curveRight style={{ height: '60px' }} />
        <Backdrop bottom={'30px'} left={'-35px'} curveLeft style={{ height: '60px' }} />
        <Backdrop bottom={'0px'} left={'-45px'} curveLeft />
        <SwapPoolTabs active={'zap'} />
        <WidoWidget
          className="wido-widget"
          width="100%"
          onConnectWalletClick={handleConnectWalletClick}
          ethProvider={ethProvider}
          snAccount={passedAccount}
          fromTokens={fromTokens}
          toTokens={toTokens}
          theme={{
            ...darkTheme,
            accent: theme.jediBlue,
            fontFamily: {
              font: "'DM Sans',sans-serif",
              variable: "'DM Sans',sans-serif"
            },
            networkDefaultShadow: 'none'
          }}
        />
      </StyledAppBody>
    </>
  )
}

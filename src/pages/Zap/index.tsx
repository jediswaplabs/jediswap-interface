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
import { HeaderNote, Header, HeaderInfo } from './styleds'
import { Account } from 'starknet'
import { Token, getSupportedTokens } from 'wido'
import { ChainId } from '@jediswap/sdk'
import { providers } from 'ethers'

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

  useEffect(() => {
    if (snChainId == ChainId.MAINNET) {
      getSupportedTokens({ chainId: [1] }).then(ethTokens => {
        setFromTokens([
          {
            chainId: 15366,
            address: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
            // name: 'Ether',
          },
          {
            chainId: 15366,
            address: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8'
            // name: 'USD Coin',
          },
          ...ethTokens
        ])
      })
      getSupportedTokens({ chainId: [15366] }).then(setToTokens)
    } else {
      setFromTokens([
        {
          chainId: 15367,
          address: '0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426'
          // name: 'Goerli USD Coin',
        },
        {
          chainId: 15367,
          address: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
          // name: 'Ether',
        },
        {
          address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          chainId: 5
          // name: 'ETH',
        }
      ])
      getSupportedTokens({ chainId: [15367] }).then(setToTokens)
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

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { BodyWrapper } from '../AppBody'

import { Backdrop, HeaderRow } from '../Swap/styleds'
import { useActiveStarknetReact } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { darkTheme, WidoWidget, isStarknetChain } from 'wido-widget'
import styled, { ThemeContext } from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { AutoColumn } from '../../components/Column'
import { HeaderNote, Header, HeaderInfo } from '../Zap/styleds'
import { Token, getSupportedTokens } from 'wido'
import { ChainId } from '@jediswap/sdk'
import { injected } from '../Zap'

export const StyledAppBody = styled(BodyWrapper)`
  padding: 0rem;
`
export default function Zap() {
  const theme = useContext(ThemeContext)

  /**
   * Starknet wallet connection
   */
  const { chainId: snChainId, account, connectedAddress, library } = useActiveStarknetReact()
  const { library: ethProvider, activate, deactivate } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const [passedAccount, setPassedAccount] = useState(account ?? undefined)

  // Work-around: unfortunately account.chainId does not get updated when the user changes network
  // Solution: re-create the account object each time chainId or account changes
  console.log('📜 LOG > Bridge > account?.chainId:', account?.chainId)
  useEffect(() => {
    if (!account || !library || !connectedAddress) {
      setPassedAccount(undefined)
    } else {
      setPassedAccount(account)
      // setPassedAccount(new Account(library, connectedAddress, account.signer))
    }
  }, [library, account, snChainId, connectedAddress, setPassedAccount])

  /**
   * Ethereum wallet connection
   */
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
    if (snChainId === ChainId.MAINNET) {
      getSupportedTokens({ chainId: [1] }).then(setFromTokens)
      setToTokens([
        {
          chainId: 15366,
          address: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
          // name: 'Ether',
        },
        {
          chainId: 15366,
          address: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8'
          // name: 'USD Coin',
        }
      ])
    } else {
      getSupportedTokens({ chainId: [5] }).then(setFromTokens)
      setToTokens([
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
        }
      ])
    }
  }, [snChainId, setFromTokens])

  return (
    <>
      <AutoColumn gap="14px" style={{ maxWidth: 470, padding: '2rem' }}>
        <HeaderRow>
          <Header>Bridge</Header>
        </HeaderRow>
        <HeaderInfo fontSize={16}>Bridge your assets over to Starknet.</HeaderInfo>
      </AutoColumn>
      <StyledAppBody>
        <Backdrop top={'0'} left={'503px'} curveRight />
        <Backdrop top={'30px'} left={'493px'} curveRight style={{ height: '60px' }} />
        <Backdrop bottom={'30px'} left={'-35px'} curveLeft style={{ height: '60px' }} />
        <Backdrop bottom={'0px'} left={'-45px'} curveLeft />
        <SwapPoolTabs active={'zap'} />
        <WidoWidget
          title="Bridge"
          className="wido-widget"
          width="100%"
          onConnectWalletClick={handleConnectWalletClick}
          ethProvider={ethProvider}
          snAccount={passedAccount}
          testnetsVisible
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

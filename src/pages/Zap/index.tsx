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
import { HeaderNote, ZapHeader, ZapHeaderInfo } from './styleds'
import { Account } from 'starknet'

export const StyledAppBody = styled(BodyWrapper)`
  padding: 0rem;
`
export const injected = new InjectedConnector({})

export default function Zap() {
  const theme = useContext(ThemeContext)
  const { chainId, account, connectedAddress, library } = useActiveStarknetReact()
  const { library: ethProvider, activate, deactivate } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const [passedAccount, setPassedAccount] = useState(account ?? undefined)

  // Work-around: unfortunately account.chainId does not get updated when the user changes network
  // Solution: re-create the account object each time chainId or account changes
  useEffect(() => {
    if (!account || !library || !connectedAddress) {
      setPassedAccount(undefined)
    } else {
      setPassedAccount(new Account(library, connectedAddress, account.signer))
    }
  }, [library, account, chainId, connectedAddress, setPassedAccount])

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

  return (
    <>
      <AutoColumn gap="14px" style={{ maxWidth: 470, padding: '2rem' }}>
        <HeaderRow>
          <ZapHeader>
            ZAP <img src={ZapIcon} />
          </ZapHeader>
        </HeaderRow>
        <ZapHeaderInfo fontSize={16}>
          Zap helps you convert any of your tokens into LP tokens with 1-click
        </ZapHeaderInfo>
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
          testnetsVisible
          ethProvider={ethProvider}
          snAccount={passedAccount}
          srcChainIds={[5, 15367]}
          dstChainIds={[15367]}
          toProtocols={['jediswap.xyz']}
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

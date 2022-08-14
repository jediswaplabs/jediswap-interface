import React from 'react'
import AppBody from '../AppBody'
import { JediSwapTabs } from '../../components/NavigationTabs'
import { Wrapper, BridgeHeaderInfo, WalletDiv } from './styleds'
import ArgentXLogo from '../../assets/images/argentx-white.png'
import MetamaskLogo from '../../assets/images/metamask.png'

export default function Bridge() {
  return (
    <AppBody>
      <JediSwapTabs active={'bridge'} />
      <Wrapper>
        <BridgeHeaderInfo fontSize={23}>Please connect your Ethereum wallet and Argent wallet</BridgeHeaderInfo>
        <WalletDiv>
          <img src={ArgentXLogo} width="30px" height="30px" /> 0x520....8848
        </WalletDiv>
        <WalletDiv>
          <img src={MetamaskLogo} width="30px" height="30px" /> MetaMask
        </WalletDiv>
      </Wrapper>
    </AppBody>
  )
}

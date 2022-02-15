import React from 'react'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import AppBody from '../AppBody'
import { Wrapper, HeaderRow, ZapHeader, StyledZapIcon } from './styleds'
import Settings from '../../components/Settings'
import { DMSansText } from '../../theme'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow } from '../../components/Row'
import { ArrowWrapper, BottomGrouping } from '../../components/swap/styleds'
import { Icon, IconWrapper } from '../Swap/styleds'
import SwapWidget from '../../assets/jedi/SwapWidget.svg'
import { useActiveStarknetReact } from '../../hooks'
import { ButtonPrimary } from '../../components/Button'
import { useWalletModalToggle } from '../../state/application/hooks'

export default function Zap() {
  const { account } = useActiveStarknetReact()

  const toggleWalletModal = useWalletModalToggle()

  const handleTypeInput = () => {
    console.log('Handle Input')
  }

  const handleMaxInput = () => {
    console.log('Handle Max')
  }

  return (
    <>
      <AppBody>
        <SwapPoolTabs active={'zap'} />
        <Wrapper>
          {/* TODO: Implement ConfirmZapModal */}
          <div style={{ marginBottom: '30px' }}>
            <HeaderRow>
              <ZapHeader>
                Zap <StyledZapIcon />
              </ZapHeader>
              <Settings />
            </HeaderRow>
          </div>
          <HeaderRow style={{ marginBottom: '16px' }}>
            <DMSansText.body>From</DMSansText.body>
            <DMSansText.body>Balance: 0</DMSansText.body>
          </HeaderRow>
          <AutoColumn>
            <CurrencyInputPanel
              id="zap-currency-input"
              value={''}
              showMaxButton={true}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
            />

            <AutoColumn justify="space-between">
              <AutoRow justify="center">
                <ArrowWrapper>
                  <IconWrapper>
                    <Icon noMargin unlimited src={SwapWidget} />
                  </IconWrapper>
                </ArrowWrapper>
              </AutoRow>
            </AutoColumn>
            <HeaderRow style={{ marginBottom: '16px' }}>
              {/* TODO: Add marginTop to HeaderRow if OutputPair Balance's length > 10. Check Swap */}
              <DMSansText.body>To LP (estimated)</DMSansText.body>
              <DMSansText.body>Balance: 0</DMSansText.body>
            </HeaderRow>
            <CurrencyInputPanel
              id="zap-currency-input"
              value={''}
              showMaxButton={false}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
            ></CurrencyInputPanel>
            {/* TODO: Implement Price of Zap and Slippage if required  */}
          </AutoColumn>

          <BottomGrouping>
            {!account ? (
              <ButtonPrimary fontSize={20} onClick={toggleWalletModal}>
                Connect Wallet
              </ButtonPrimary>
            ) : (
              <ButtonPrimary fontSize={20} disabled>
                Enter an amount
              </ButtonPrimary>
            )}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
    </>
  )
}

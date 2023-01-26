import { useEffect, useState } from 'react'
import React from 'react'
import styled from 'styled-components'
import metamask from '../../assets/images/metamask.png'
import { WalletText } from './styleds'
import { shortenAddress } from '../../utils'

const MetaMask: React.FC = () => {
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState<boolean>(false)
  const [ethereumAccount, setEthereumAccount] = useState<string | null>(null)

  const InfoCard = styled.button<{ active?: boolean }>`
    background-color: ${({ theme, active }) => (active ? theme.bg3 : theme.bg2)};
    padding: 2rem;
    outline: none;
    border: 1px solid;
    border-radius: 8px;
    width: 100% !important;
    &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primary1};
  }
  /* border-color: ${({ theme, active }) => (active ? 'transparent' : theme.bg3)}; */
`

  const OptionCard = styled(InfoCard as any)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 2rem;
    padding: 1rem;
    background: ${({ theme }) => theme.jediNavyBlue};
  `

  const OptionCardLeft = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap};
    justify-content: center;
    height: 100%;
  `

  const IconWrapper = styled.div<{ size?: number | null }>`
    ${({ theme }) => theme.flexColumnNoWrap};
    align-items: center;
    justify-content: center;
    & > img,
    span {
      height: ${({ size }) => (size ? size + 'px' : '24px')};
      width: ${({ size }) => (size ? size + 'px' : '24px')};
    }
    ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
  `

  const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean }>`
    margin-top: 0;
    &:hover {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
    /* border: ${({ clickable, theme }) => (clickable ? `1px solid ${theme.primary1}` : ``)}; */
    }
    opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
  `

  useEffect(() => {
    if ((window as any).ethereum) {
      setIsMetamaskInstalled(true)
    }
  }, [])

  //Does the User have an Ethereum wallet/account?
  async function connectMetamaskWallet(): Promise<void> {
    //to get around type checking
    (window as any).ethereum
      .request({
        method: 'eth_requestAccounts'
      })
      .then((accounts: string[]) => {
        setEthereumAccount(accounts[0])
      })
      .catch((error: any) => {
        alert(`Something went wrong: ${error}`)
      })
  }

  if (ethereumAccount === null) {
    return (
      <OptionCardClickable onClick={connectMetamaskWallet}>
        <OptionCardLeft>
          <IconWrapper>
            <img src={metamask} alt={'metamask'} />
          </IconWrapper>
        </OptionCardLeft>
        {isMetamaskInstalled ? (
         <WalletText style={{ color: 'white' }}>Metamask</WalletText>
        ) : (
          <p style={{ color: 'white' }}>Install Your Metamask wallet</p>
        )
        }
          
      </OptionCardClickable>
      
    );
  }


 return (
   <OptionCardClickable>
        <IconWrapper>
          <img src={metamask} alt={'metamask'} />
        </IconWrapper>
       <WalletText style={{ color: 'white' }}>
         {ethereumAccount && shortenAddress(ethereumAccount)}
       </WalletText>
   </OptionCardClickable>
 )
}



export default MetaMask;

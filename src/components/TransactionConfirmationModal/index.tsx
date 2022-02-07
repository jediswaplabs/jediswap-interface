import { ChainId } from '@jediswap/sdk'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Modal from '../Modal'
import { ExternalLink } from '../../theme'
import { Text } from 'rebass'
import { CloseIcon, CustomLightSpinner } from '../../theme/components'
import { RowBetween } from '../Row'
import { AlertTriangle, ArrowUp } from 'react-feather'
import { ButtonGradient, ButtonPrimary } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
import Circle from '../../assets/jedi/loadingCircle.svg'

import { getVoyagerLink } from '../../utils'
import { useActiveStarknetReact } from '../../hooks'
import openInBrowser from '../../assets/jedi/openInBrowser.svg'

const Wrapper = styled.div`
  width: 100%;
  background: linear-gradient(to top right, #50d5ff, #ef35ff);
  color: ${({ theme }) => theme.jediWhite};
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0px;
  /* border-radius: 8px; */
  padding: 1px;
`
const Section = styled(AutoColumn)<{ withBorderBottom?: boolean }>`
  padding: 16px 32px;
  background-color: ${({ theme }) => theme.jediNavyBlue};
  border-radius: ${({ withBorderBottom }) => (withBorderBottom ? '8px' : '8px 8px 0 0')};
`

const BottomSection = styled(Section)`
  border-top-right-radius: 0px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 0px 0 40px;
`
const TextWrapper = styled.div`
  margin-top: 18px;
`

const Row = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
`
function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
  return (
    <Wrapper>
      <Section style={{ padding: '35px 32px 32px' }} withBorderBottom>
        {/* <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween> */}
        <ConfirmedIcon>
          <CustomLightSpinner src={Circle} alt="loader" size={'80px'} />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={700} fontSize={24} fontFamily={'DM Sans'} color="#F2F2F2" letterSpacing={'0px'}>
            Waiting For Confirmation
          </Text>
          <AutoColumn gap="12px" justify={'center'}>
            <Text
              fontWeight={400}
              fontSize={16}
              color="#F2F2F2"
              textAlign="center"
              fontFamily={'DM Sans'}
              letterSpacing={'0px'}
            >
              {pendingText}
            </Text>
          </AutoColumn>
          <Text
            fontSize={16}
            fontWeight={400}
            color="#F2F2F2"
            textAlign="center"
            fontFamily={'DM Sans'}
            letterSpacing={'0px'}
            marginTop={'50px'}
          >
            Confirm this transaction in your wallet
          </Text>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
}) {
  const theme = useContext(ThemeContext)

  return (
    <Wrapper>
      <Section style={{ padding: '18px' }} withBorderBottom>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <ConfirmedIcon>
          <ArrowUp strokeWidth={1} size={90} color={theme.jediWhite} />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={700} fontSize={24} fontFamily={'DM Sans'} color={'#FFFFFF'} letterSpacing={'0px'}>
            Transaction Submitted
          </Text>

          {chainId && hash && (
            <ExternalLink href={getVoyagerLink(chainId, hash, 'transaction')}>
              <Row>
                <img src={openInBrowser} alt="open" />
                <Text
                  fontWeight={500}
                  fontSize={14}
                  color={theme.jediWhite}
                  fontFamily={'DM Sans'}
                  letterSpacing={'0px'}
                >
                  Open in browser
                </Text>
              </Row>
            </ExternalLink>
          )}
          <ButtonGradient onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
            <Text fontWeight={500} fontSize={20}>
              Close
            </Text>
          </ButtonGradient>
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

export function ConfirmationModalContent({
  title,
  titleFont,
  bottomContent,
  onDismiss,
  topContent
}: {
  title: string
  titleFont?: {
    size?: number
    family?: string
    letterSpacing?: string
    weight?: number
    lineHeight?: string
  }
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <Wrapper>
      <Section style={{ paddingBottom: '8px' }}>
        <TextWrapper>
          <RowBetween>
            <Text
              fontWeight={titleFont?.weight ?? 400}
              fontSize={titleFont?.size ?? 20}
              fontFamily={titleFont?.family ?? 'Soloist Title'}
              letterSpacing={titleFont?.letterSpacing ?? '-0.1em'}
              lineHeight={titleFont?.lineHeight}
            >
              {title}
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
        </TextWrapper>
        {topContent()}
      </Section>
      <BottomSection gap="12px" style={{ paddingTop: '8px' }}>
        {bottomContent()}
      </BottomSection>
    </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useContext(ThemeContext)
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            Error
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
          <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
          <Text fontWeight={500} fontSize={16} color={theme.red1} style={{ textAlign: 'center', width: '85%' }}>
            {message}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
      </BottomSection>
    </Wrapper>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content
}: ConfirmationModalProps) {
  const { chainId } = useActiveStarknetReact()

  if (!chainId) return null

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
      ) : (
        content()
      )}
    </Modal>
  )
}

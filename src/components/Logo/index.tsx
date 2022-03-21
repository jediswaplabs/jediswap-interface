import React, { useState } from 'react'
import { HelpCircle } from 'react-feather'
import { ImageProps } from 'rebass'
import styled from 'styled-components'

const FilledHelpCircle = styled(HelpCircle)`
  border: none;
  fill: ${({ theme }) => theme.signalGreen};
`

const BAD_SRCS: { [tokenAddress: string]: true } = {}

export interface LogoProps extends Pick<ImageProps, 'style' | 'alt' | 'className'> {
  srcs: string[]
  filled?: boolean
  size: number
}

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo({ size = 24, srcs, alt, filled = false, ...rest }: LogoProps) {
  const [, refresh] = useState<number>(0)

  const src: string | undefined = srcs.find(src => !BAD_SRCS[src])

  if (src) {
    return (
      <img
        {...rest}
        alt={alt}
        src={src}
        onError={() => {
          if (src) BAD_SRCS[src] = true
          refresh(i => i + 1)
        }}
      />
    )
  }

  return (
    <div {...rest}>
      <svg width={size} height={size} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="url(#paint0_linear_1829_4503)" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15 20.6602C14.5399 20.6602 14.1667 21.0335 14.1667 21.4935V21.7536C14.1667 22.2153 14.5399 22.587 15 22.587C15.4601 22.587 15.8333 22.2153 15.8333 21.7536V21.4935C15.8333 21.0335 15.4601 20.6602 15 20.6602ZM14.9867 7.41338C12.0833 7.41338 9.72008 9.77663 9.72008 12.68C9.72008 13.14 10.0933 13.5133 10.5534 13.5133C10.7419 13.5133 10.9068 13.4398 11.0467 13.3332C11.2485 13.1816 11.3867 12.9515 11.3867 12.68C11.3867 10.6949 13.0017 9.08005 14.9867 9.08005C16.0352 9.08005 17.0867 9.56647 17.8035 10.38C18.4235 11.0884 18.7035 11.9515 18.59 12.8149C18.4502 13.8717 17.6268 14.4534 16.6701 15.1301C15.7618 15.7716 14.7585 16.4933 14.34 17.7067C14.2585 17.9433 14.19 18.1934 14.1583 18.4734C14.1069 18.9301 14.4367 19.3417 14.8934 19.3932C14.925 19.3967 14.9566 19.3982 14.9886 19.3982C15.4068 19.3982 15.7667 19.0851 15.8151 18.6585C15.9183 17.7448 16.5734 17.2383 17.6333 16.4899C18.7466 15.7034 20.0084 14.8117 20.2418 13.0335C20.4185 11.6867 19.9966 10.3533 19.0551 9.28167C18.0283 8.11167 16.5083 7.41349 14.9867 7.41349V7.41338ZM15 25.8333C9.02683 25.8333 4.16667 20.9735 4.16667 15C4.16667 9.02841 9.02683 4.16667 15 4.16667C20.9735 4.16667 25.8333 9.02841 25.8333 15C25.8333 20.9735 20.9735 25.8333 15 25.8333ZM15 2.5C8.10675 2.5 2.5 8.10825 2.5 15C2.5 21.8933 8.10675 27.5 15 27.5C21.8933 27.5 27.5 21.8933 27.5 15C27.5 8.10825 21.8933 2.5 15 2.5Z"
          fill="white"
        />
        <defs>
          <linearGradient
            id="paint0_linear_1829_4503"
            x1="5.13084"
            y1="3"
            x2="30.6803"
            y2="5.52318"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#29AAFD" />
            <stop offset="1" stopColor="#FF00E9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

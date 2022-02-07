import styled from 'styled-components'
import React from 'react'
import { AnyArray } from 'immer/dist/internal'
import Row from '../../components/Row'
import { Text } from 'rebass'

export const TRow = styled.tr`
`

export const TH = styled.th`
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
  letter-spacing: 0em;
  padding-top: 25px;
  padding-bottom: 25px;
  text-align: center;
  color: ${({ theme }) => theme.jediWhite};
  border-bottom: solid 1px rgba(255, 255, 255, 0.1);
`

export const TitleText = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  color: ${({ theme }) => theme.jediWhite};
`

export const TitleIcon = styled.div<{color?: string; left? : string}>`
    height: 20px;
    width: 20px;
    border-radius: 10px;
    position: absolute;
    left: ${({left}) => left};
    background-color: ${({color}) => color};
`

export const IconRow = styled.div`
    position: relative;
    height: 20px;
    width: 35px;
`

export const TData = styled.td`
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 16px;
  text-align: center;
  height: 20px;
  color: ${({ theme }) => theme.jediWhite};
  padding:0;
  padding-top: 16px;
  padding-bottom: 16px;    
  border-bottom: solid 1px rgba(255, 255, 255, 0.1);
`

export const Table = styled.table`
width: 100%;
border-collapse: collapse;
`

export const Icons = () => {
    return <IconRow>
        <TitleIcon color='red'/>
        <TitleIcon color='yellow' left="15px"/>
    </IconRow>
}

export const TableRow = ({data} : {data : AnyArray}) => {
    return <TRow>
        {
            data.map((val, i) => <TData key={i}>
                {val}
            </TData>)
        }
    </TRow>
}

export const TableHeader = () => {
    const data = ['Pool name', 'Liquidity', 'Volume (24H)', 'Fees(24H)', 'APR'];
    return <TRow>
        {
            data.map((val, i) => <TH key={i}>
                {val}
            </TH>)
        }
    </TRow>
}

export const TableFooter = () => {
    return <Row padding={'16px 0 25px 0'} justifyContent={'center'}>
        <Text
          fontWeight={400}
          fontSize={14}
          fontFamily={'DM Sans'}
          letterSpacing={'0px'}
          color={'#FFFFFF'}
        >Page 1 of 1</Text>
  </Row>
}
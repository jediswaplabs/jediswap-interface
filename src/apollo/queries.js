import gql from 'graphql-tag'

export const PAIRS_DATA_FOR_REWARDS = ({ pairIds = [] }) => {
  const poolsString = `[${pairIds.map(pool => `"${pool}"`).join(',')}]`
  let queryString = `
    query pairDayDatas {
      pairDayDatas(
        where: {
          pairIn: ${poolsString},
        }
        orderBy: "date"
        orderByDirection: "desc"
        first: ${10 * pairIds.length}
      ) {
        pairId
        date
        dailyVolumeUSD
        reserveUSD
      }
    }
  `
  return gql(queryString)
}

import { useMemo } from 'react'
import uriToHttp from '../utils/uriToHttp'

export default function useHttpLocations(uri: string | undefined): string[] {
  return useMemo(() => {
    if (uri?.startsWith('data:')) {
      return [uri]
    }
    return uri ? uriToHttp(uri) : []
  }, [uri])
}

import { useMemo } from 'react'
import { getChecksumAddress } from 'starknet'

export function useAddressNormalizer(addr: string | null | undefined): string | null {
  return useMemo(() => {
    if (addr && typeof addr === 'string') return getChecksumAddress(addr)
    return null
  }, [addr])
}

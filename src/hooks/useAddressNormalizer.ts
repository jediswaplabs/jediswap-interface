import { useMemo } from 'react'

export function useAddressNormalizer(addr: string | null | undefined): string | null {
  return useMemo(() => {
    if (typeof addr === 'string' && addr.match(/^(0x)?[0-9a-fA-F]{63}$/)) {
      const address = addr.substring(0, 2) === '0x' ? addr : `0x${addr}`
      return address
    }
    return null
  }, [addr])
}

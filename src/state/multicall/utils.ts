import { Abi, Calldata, stark, FunctionAbi, RawArgs, CallData } from 'starknet'
export function computeCallDataProps(args: RawArgs = {}): { calldata_len: number | string; calldata: Calldata } {
  console.log('🚀 ~ file: utils.ts:3 ~ computeCallDataProps ~ args:', args)
  const calldata = CallData.compile(args)
  console.log('🚀 ~ file: utils.ts:5 ~ computeCallDataProps ~ calldata:', calldata)

  if (Array.isArray(args)) {
    return {
      calldata_len: calldata[0],
      calldata: calldata.slice(1)
    }
  }

  if (Object.keys(args).length > 0) {
    return {
      calldata_len: Object.keys(args).length,
      calldata: calldata
    }
  }

  return {
    calldata_len: 0,
    calldata: calldata
  }
}

export function validateMethodAbi(abis: Abi): abis is FunctionAbi[] {
  return abis.every(abi => abi.type === 'function')
}

import { Abi, Args, Calldata, compileCalldata, FunctionAbi } from '@jediswap/starknet'
export function computeCallDataProps(args: Args = {}): { calldata_len: number | string; calldata: Calldata } {
  //   if (!args) {
  //     return {
  //       calldata_len: 0,
  //       calldata: undefined
  //     }
  //   }

  const calldata = compileCalldata(args)

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

export function validateMethodAbi(abi: Abi): abi is FunctionAbi {
  return abi.type === 'function'
}

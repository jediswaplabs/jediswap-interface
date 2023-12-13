import {jsonRpcProvider} from "@starknet-react/core";

const provider = jsonRpcProvider({
    rpc: (chain) => {
        return {
            nodeUrl: chain.network === 'goerli' ? 'https://rpc.starknet-testnet.lava.build' : `https://starknet-${chain.network}-rpc.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c`
        }
    }
})

export default provider

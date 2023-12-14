import {jsonRpcProvider} from "@starknet-react/core";
import {isLocalEnvironment} from "../connectors";

const provider = jsonRpcProvider({
    rpc: (chain) => {
        let nodeUrl;
        switch (true) {
            case (isLocalEnvironment()): {
                nodeUrl = 'https://rpc.starknet.lava.build/';
                break;
            }
            case (chain.network === 'mainnet'): {
                nodeUrl = 'https://rpc-proxy.jediswap.xyz/api/';
                break;
            }
            default: {
                nodeUrl = 'https://rpc-proxy.testnet.jediswap.xyz/api/';
            }
        }

        return {
            nodeUrl
        }
    }
})

export default provider

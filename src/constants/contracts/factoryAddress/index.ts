import { StarknetChainId, starknetChainId } from "../..";
import FACTORY_ABI from "./abi.json";

//change ABI and Contracts

const FACTORY_ADDRESS: { [chainId in starknetChainId]?: string } = {
  [StarknetChainId.MAINNET]:
    "0xdad44c139a476c7a17fc8141e6db680e9abc9f56fe249a105094c44382c2fd",
  [StarknetChainId.TESTNET]:
    "0x262744f8cea943dadc8823c318eaf24d0110dee2ee8026298f49a3bc58ed74a"
};

export { FACTORY_ABI, FACTORY_ADDRESS };

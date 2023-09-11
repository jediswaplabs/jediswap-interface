import { WebWalletConnector } from "@argent/starknet-react-webwallet-connector";
import { InjectedConnector } from "@starknet-react/core";
import { ArgentXConnector } from "@web3-starknet-react/argentx-connector";
import { BraavosConnector } from "@web3-starknet-react/braavos-connector";
import { StarknetChainId } from "../constants";

export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.REACT_APP_CHAIN_ID ?? "5"
);

export const isTestnetEnvironment = () => {
  if (!location) {
    return false;
  }
  if (String(location) === "//") {
    return false;
  }
  const host = new URL(String(location))?.host || "";
  return host === "app.testnet.jediswap.xyz";
};

export const isStagingEnvironment = () => {
  if (!location) {
    return false;
  }
  if (String(location) === "//") {
    return false;
  }
  const host = new URL(String(location))?.host || "";
  return host === "app.staging.jediswap.xyz";
};

export const isProductionEnvironment = () => {
  if (!location) {
    return false;
  }
  if (String(location) === "//") {
    return false;
  }
  const host = new URL(String(location))?.host || "";
  return host === "app.jediswap.xyz";
};

export const isProductionChainId = (id: string) => {
  return id === StarknetChainId.MAINNET;
};

export const isTestnetChainId = (id: string) => {
  return id === StarknetChainId.TESTNET || StarknetChainId.TESTNET2;
};

export const webWalletUrl = isTestnetEnvironment()
  ? "https://web.hydrogen.argent47.net/"
  : "https://web.argent.xyz/";

export const argentX = new InjectedConnector({ options: { id: "argentX" } });
export const braavosWallet = new InjectedConnector({
  options: { id: "braavos" }
});
export const argentWebWallet = new WebWalletConnector({
  url: webWalletUrl
});

export type injectedConnector = "argentX" | "braavos";

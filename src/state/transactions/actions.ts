import { createAction } from "@reduxjs/toolkit";
import { BlockNumber, Status, constants } from "starknet";
import { ChainIdStarknet } from "../../constants";
export interface SerializableTransactionReceipt {
  transactionIndex?: number;
  blockHash?: string;
  transactionHash: string;
  blockNumber?: BlockNumber;
  status?: Status;
}

export const addTransaction = createAction<{
  chainId: ChainIdStarknet;
  hash: string;
  from: string;
  approval?: { tokenAddress: string; spender: string };
  claim?: { recipient: string };
  summary?: string;
}>("transactions/addTransaction");
export const clearAllTransactions = createAction<{ chainId: ChainIdStarknet }>(
  "transactions/clearAllTransactions"
);
export const updateTransaction = createAction<{
  chainId: ChainIdStarknet;
  hash: string;
  receipt: SerializableTransactionReceipt;
}>("transactions/updateTransaction");
export const checkedTransaction = createAction<{
  chainId: ChainIdStarknet;
  hash: string;
  blockNumber: number;
}>("transactions/checkedTransaction");

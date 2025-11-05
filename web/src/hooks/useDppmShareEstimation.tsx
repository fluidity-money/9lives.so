import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { Account } from "thirdweb/wallets";

export default function useDppmShareEstimation({
  tradingAddr,
  account,
  outcomeId,
  enabled = true,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  outcomeId: `0x${string}`;
  enabled?: boolean;
}) {
  return useQuery<[number, number, number]>({
    queryKey: ["dppmShareEstimation", tradingAddr, account?.address, outcomeId],
    queryFn: async () => {
      if (!account?.address) return;
      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.destinationChain,
      });
      const estimateTx = prepareContractCall({
        contract: tradingContract,
        method: "dppmSimulatePayoffForAddress",
        params: [account.address, outcomeId],
      });
      const res = await simulateTransaction({
        transaction: estimateTx,
      });
      return res.map((i: bigint) => Number(formatFusdc(i, 2)));
    },
    initialData: [0, 0, 0],
    enabled,
  });
}

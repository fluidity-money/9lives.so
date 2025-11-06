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
  isWinning,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  outcomeId: `0x${string}`;
  isWinning: boolean;
}) {
  return useQuery({
    queryKey: ["dppmShareEstimation", tradingAddr, account?.address, outcomeId],
    queryFn: async () => {
      if (!account?.address) return [BigInt(0), BigInt(0), BigInt(0)];

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
      return await simulateTransaction({
        transaction: estimateTx,
      });
    },
    select: (data) => {
      if (isWinning) {
        return data.map((i: bigint) => Number(formatFusdc(i, 2)));
      } else {
        return [0, 0, Number(formatFusdc(data[2], 2))];
      }
    },
    initialData: [BigInt(0), BigInt(0), BigInt(0)],
  });
}

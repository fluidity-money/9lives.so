import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import formatFusdc from "@/utils/format/formatUsdc";
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
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  outcomeId: `0x${string}`;
}) {
  const [res, setRes] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    if (account) {
      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.destinationChain,
      });
      const estimateTx = prepareContractCall({
        contract: tradingContract,
        method: "dppmSimulatePayoffForAddress",
        params: [account?.address, outcomeId],
      });
      (async () => {
        const res = await simulateTransaction({
          transaction: estimateTx,
          account,
        });
        setRes(res.map((i: bigint) => Number(formatFusdc(i, 2))));
      })();
    }
  }, [account]);

  return res;
}

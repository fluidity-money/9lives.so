import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import formatFusdc from "@/utils/format/formatUsdc";
import { parseUnits } from "ethers";
import { useEffect, useState } from "react";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

export default function useDppmWinEstimation({
  outcomeId,
  usdValue,
  tradingAddr,
  enabled = true,
}: {
  outcomeId: `0x${string}`;
  usdValue: number;
  tradingAddr: `0x${string}`;
  enabled?: boolean;
}) {
  const [res, setRes] = useState<[number, number, number]>([0, 0, 0]); // [shares,boost,refund]
  const tradingContract = getContract({
    abi: tradingAbi,
    address: tradingAddr,
    client: config.thirdweb.client,
    chain: config.destinationChain,
  });
  const decimals = config.contracts.decimals.fusdc;
  const estimateTx = prepareContractCall({
    contract: tradingContract,
    method: "dppmSimulateEarningsB866B112",
    params: [parseUnits(usdValue.toFixed(decimals), decimals), outcomeId],
  });
  const account = useActiveAccount();
  useEffect(() => {
    (async () => {
      if (account && enabled) {
        const res = await simulateTransaction({
          transaction: estimateTx,
          account,
        });
        setRes(res.map((i: bigint) => Number(formatFusdc(i, 2))));
      }
    })();
  }, [account, estimateTx]);
  return res;
}

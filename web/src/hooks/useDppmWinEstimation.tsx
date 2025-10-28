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
}: {
  outcomeId: `0x${string}`;
  usdValue: number;
  tradingAddr: `0x${string}`;
}) {
  const [estimation, setEstimation] = useState<string>();
  const tradingContract = getContract({
    abi: tradingAbi,
    address: tradingAddr,
    client: config.thirdweb.client,
    chain: config.destinationChain,
  });
  const decimals = config.contracts.decimals.fusdc;
  const estimateTx = prepareContractCall({
    contract: tradingContract,
    method: "dppmSimulateEarnings",
    params: [parseUnits(usdValue.toFixed(decimals), decimals), outcomeId],
  });
  const account = useActiveAccount();
  useEffect(() => {
    (async () => {
      if (account) {
        const res = await simulateTransaction({
          transaction: estimateTx,
          account,
        });
        setEstimation(formatFusdc(res, 2));
      }
    })();
  }, [account, estimateTx]);
  return estimation;
}

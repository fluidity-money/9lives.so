import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { PayoffResponse } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import { useEffect, useState } from "react";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { Account } from "thirdweb/wallets";
export default function useDppmShareEstimationAll({
  tradingAddr,
  account,
  enabled = true,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  enabled?: boolean;
}) {
  const [res, setRes] = useState<PayoffResponse[]>([
    { dppmFusdc: 0, ninetailsLoserFusd: 0, ninetailsWinnerFusdc: 0 },
    { dppmFusdc: 0, ninetailsLoserFusd: 0, ninetailsWinnerFusdc: 0 },
  ]);

  useEffect(() => {
    if (account && enabled) {
      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.destinationChain,
      });
      const estimateTx = prepareContractCall({
        contract: tradingContract,
        method: "dppmSimulatePayoffForAddressAll",
        params: [account?.address],
      });
      (async () => {
        const res = await simulateTransaction({
          transaction: estimateTx,
          account,
        });
        setRes(
          res.map((i: PayoffResponse) => ({
            dppmFusdc: Number(formatFusdc(i.dppmFusdc, 2)),
            ninetailsLoserFusd: Number(formatFusdc(i.ninetailsLoserFusd, 2)),
            ninetailsWinnerFusdc: Number(
              formatFusdc(i.ninetailsWinnerFusdc, 2),
            ),
          })),
        );
      })();
    }
  }, [account]);

  return res;
}

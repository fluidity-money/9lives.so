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

export default function useDppmShareEstimationAll({
  tradingAddr,
  account,
  enabled = true,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  enabled?: boolean;
}) {
  const [res, setRes] = useState<
    [[number, number, number], [number, number, number]]
  >([
    [0, 0, 0],
    [0, 0, 0],
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
          res.map((i: bigint[]) =>
            i.map((i: bigint) => Number(formatFusdc(i, 2))),
          ),
        );
      })();
    }
  }, [account]);

  return res;
}

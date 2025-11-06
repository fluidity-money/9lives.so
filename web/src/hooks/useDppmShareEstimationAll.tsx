import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { PayoffResponse } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { Account } from "thirdweb/wallets";
export default function useDppmShareEstimationAll({
  tradingAddr,
  account,
  enabled,
}: {
  tradingAddr: `0x${string}`;
  account?: Account;
  enabled: boolean;
}) {
  return useQuery<PayoffResponse[]>({
    queryKey: ["dppmShareEstimationForAll", tradingAddr, account?.address],
    queryFn: async () => {
      if (!account?.address)
        return [
          { dppmFusdc: 0, ninetailsLoserFusd: 0, ninetailsWinnerFusdc: 0 },
          { dppmFusdc: 0, ninetailsLoserFusd: 0, ninetailsWinnerFusdc: 0 },
        ];

      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.destinationChain,
      });

      const estimateTx = prepareContractCall({
        contract: tradingContract,
        method: "dppmSimulatePayoffForAddressAll",
        params: [account.address],
      });

      const res = await simulateTransaction({
        transaction: estimateTx,
      });

      return res.map((i: PayoffResponse) => ({
        dppmFusdc: Number(formatFusdc(i.dppmFusdc, 2)),
        ninetailsLoserFusd: Number(formatFusdc(i.ninetailsLoserFusd, 2)),
        ninetailsWinnerFusdc: Number(formatFusdc(i.ninetailsWinnerFusdc, 2)),
      }));
    },
    initialData: [
      { dppmFusdc: 0, ninetailsLoserFusd: 0, ninetailsWinnerFusdc: 0 },
      { dppmFusdc: 0, ninetailsLoserFusd: 0, ninetailsWinnerFusdc: 0 },
    ],
    enabled,
  });
}

import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import { parseUnits } from "ethers";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";

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
  return useQuery<[number, number, number]>({
    queryKey: ["dppmWinEstimation", tradingAddr, outcomeId, usdValue],
    queryFn: async () => {
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
      const res = await simulateTransaction({
        transaction: estimateTx,
      });
      return res.map((i: bigint) => Number(formatFusdc(i, 2)));
    },
    enabled,
    initialData: [0, 0, 0],
  });
}

import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { usePublicClient } from "wagmi";

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
  const publicClient = usePublicClient()
  return useQuery<number[]>({
    queryKey: ["dppmWinEstimation", tradingAddr, outcomeId, usdValue],
    queryFn: async () => {
      if (!publicClient) {
        console.error("Public client is not set")
        return [0, 0, 0]
      }

      const decimals = config.contracts.decimals.fusdc;

      const res = await publicClient.simulateContract({
        abi: tradingAbi,
        address: tradingAddr,
        functionName: "dppmSimulateEarningsB866B112",
        args: [parseUnits(usdValue.toFixed(decimals), decimals), outcomeId],
      })

      return res.result.map((i) => Number(formatFusdc(i, 2)))
    },
    enabled,
    initialData: [0, 0, 0],
  });
}

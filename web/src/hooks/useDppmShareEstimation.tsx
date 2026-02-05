import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";

export default function useDppmShareEstimation({
  tradingAddr,
  address,
  outcomeId,
  isWinning,
}: {
  tradingAddr: `0x${string}`;
  address?: string;
  outcomeId: `0x${string}`;
  isWinning: boolean;
}) {
  return useQuery({
    queryKey: ["dppmShareEstimation", tradingAddr, address, outcomeId],
    queryFn: async () => {
      const initialData = [BigInt(0), BigInt(0), BigInt(0)];
      const publicClient = createPublicClient({
        chain: config.destinationChain,
        transport: http(),
      });
      if (!address) return initialData;
      if (!publicClient) {
        console.error("Public client is not set");
        return initialData;
      }
      const simulation = await publicClient.simulateContract({
        abi: tradingAbi,
        address: tradingAddr,
        account: address as `0x${string}`,
        functionName: "dppmSimulatePayoffForAddress",
        args: [address as `0x${string}`, outcomeId],
      });
      return simulation.result;
    },
    select: (data) => {
      if (isWinning) {
        return [
          Number(formatFusdc(data[0], 2)),
          Number(formatFusdc(data[1], 2)),
          0,
        ];
      } else {
        return [0, 0, Number(formatFusdc(data[2], 2))];
      }
    },
    initialData: [BigInt(0), BigInt(0), BigInt(0)],
  });
}

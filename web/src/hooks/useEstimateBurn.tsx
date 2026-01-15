import tradingAbi from "@/config/abi/trading";
import { useQuery } from "@tanstack/react-query";
import useCheckAndSwitchChain from "./useCheckAndSwitchChain";
import { createPublicClient, http } from "viem";
import config from "@/config";

export default function useEstimateBurn({
  outcomeId,
  tradingAddr,
  share,
  address,
}: {
  outcomeId: `0x${string}`;
  tradingAddr: `0x${string}`;
  share?: bigint;
  address?: string;
}) {
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  return useQuery({
    queryKey: ["estimateBurn", outcomeId, tradingAddr, Number(share), address],
    queryFn: async () => {
      if (!address) return BigInt(0);
      if (!share || share <= BigInt(0)) return BigInt(0);
      const publicClient = createPublicClient({
        chain: config.destinationChain,
        transport: http(),
      });
      if (!publicClient) throw new Error("Public client is not set");
      await checkAndSwitchChain();
      const usdc = await publicClient.simulateContract({
        address: tradingAddr,
        abi: tradingAbi,
        functionName: "estimateBurnE9B09A17",
        args: [outcomeId, share],
      });
      return usdc.result;
    },
  });
}

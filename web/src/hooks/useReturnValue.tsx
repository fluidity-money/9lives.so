import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { useQuery } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { usePublicClient } from "wagmi";

export default function useReturnValue({
  shareAddr,
  outcomeId,
  tradingAddr,
  fusdc,
}: {
  shareAddr: string;
  tradingAddr: `0x${string}`;
  outcomeId: `0x${string}`;
  fusdc: number;
}) {
  const amount = parseUnits(fusdc.toString(), config.contracts.decimals.fusdc);
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["returnValue", shareAddr, tradingAddr, outcomeId, fusdc],
    queryFn: async () => {
      const simulation = await publicClient?.simulateContract({
        address: tradingAddr,
        abi: tradingAbi,
        functionName: "quoteC0E17FC7",
        args: [outcomeId, amount],
      })
      return simulation?.result[0];
    },
    placeholderData: (prev) => prev ?? BigInt(0),
  });
}

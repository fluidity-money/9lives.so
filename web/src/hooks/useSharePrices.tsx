import tradingAbi from "@/config/abi/trading";
import { useQuery } from "@tanstack/react-query";
import formatFusdc from "@/utils/format/formatUsdc";
import { createPublicClient, http } from "viem";
import config from "@/config";

export default function useSharePrices({
  tradingAddr,
  outcomeIds,
}: {
  tradingAddr: string;
  outcomeIds: `0x${string}`[];
}) {
  return useQuery<{ id: `0x${string}`; price: string }[]>({
    queryKey: ["sharePrices", tradingAddr, outcomeIds],
    queryFn: async () => {
      const publicClient = createPublicClient({
        chain: config.destinationChain,
        transport: http(),
      });
      if (!publicClient) {
        return [];
      }

      const res = await Promise.all<bigint>(
        outcomeIds.map(
          async (outcomeId) =>
            (
              await publicClient.simulateContract({
                abi: tradingAbi,
                address: tradingAddr as `0x${string}`,
                functionName: "priceA827ED27",
                args: [outcomeId],
              })
            ).result,
        ),
      );
      return res.map((price, idx) => ({
        id: outcomeIds[idx],
        price: price ? formatFusdc(Number(price), 2) : "0.00",
      }));
    },
  });
}

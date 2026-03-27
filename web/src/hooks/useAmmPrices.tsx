import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { Outcome } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";

type Response = {
  identifier: string;
  name: string;
  price: bigint;
};
export default function useAmmPrices(
  tradingAddr: `0x${string}`,
  outcomes: Outcome[],
) {
  const publicClient = createPublicClient({
    chain: config.destinationChain,
    transport: http(config.destinationChain.rpcUrls.default.http[0]),
  });
  return useQuery<Response[], Error, { id: string; price: number }[]>({
    queryKey: ["prices", tradingAddr, outcomes],
    queryFn: async () => {
      const res = await Promise.all(
        outcomes.map(async (o) => {
          try {
            const simulation = await publicClient.simulateContract({
              address: tradingAddr,
              abi: tradingAbi,
              functionName: "priceA827ED27",
              args: [o.identifier],
            });

            return { ...o, price: simulation.result ?? BigInt(0) };
          } catch (err) {
            console.error(`Error fetching price for ${o.name}:`, err);
            return { ...o, price: BigInt(0) };
          }
        }),
      );
      return res;
    },
    select: (data) =>
      data.map((i) => ({
        id: i.identifier,
        price: Number(formatFusdc(i.price, 6)),
      })),
  });
}

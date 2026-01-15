import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { Outcome } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
export default function useDppmShareEstimationAll({
  tradingAddr,
  address,
  enabled,
  isPriceAbove,
  outcomes,
}: {
  tradingAddr: `0x${string}`;
  address?: string;
  enabled: boolean;
  isPriceAbove: boolean;
  outcomes: Outcome[];
}) {
  return useQuery({
    queryKey: ["dppmShareEstimationForAll", tradingAddr, address, isPriceAbove],
    queryFn: async () => {
      const initialData = outcomes.map((o) => ({
        identifier: o.identifier,
        dppmFusdc: BigInt(0),
        ninetailsLoserFusd: BigInt(0),
        ninetailsWinnerFusdc: BigInt(0),
      }));
      if (!address) return initialData;
      const publicClient = createPublicClient({
        chain: config.destinationChain,
        transport: http(),
      });
      if (!publicClient) {
        console.error("Public client is not set");
        return initialData;
      }

      return await publicClient.readContract({
        address: tradingAddr,
        abi: tradingAbi,
        functionName: "dppmSimulatePayoffForAddressAll",
        args: [address as `0x${string}`],
      });
    },
    select: (data) => {
      const down = data.find((i) => i.identifier === outcomes[0].identifier);
      const up = data.find((i) => i.identifier === outcomes[1].identifier);

      if (!down || !up) throw new Error("Outcomes doesnt match");

      if (isPriceAbove) {
        return [
          {
            identifier: down.identifier,
            dppmFusdc: 0,
            ninetailsWinnerFusdc: 0,
            ninetailsLoserFusd: Number(formatFusdc(down.ninetailsLoserFusd, 2)),
          }, // Down outcome = Looser
          {
            identifier: up.identifier,
            dppmFusdc: Number(formatFusdc(up.dppmFusdc, 2)),
            ninetailsWinnerFusdc: Number(
              formatFusdc(up.ninetailsWinnerFusdc, 2),
            ),
            ninetailsLoserFusd: 0,
          }, //Up outcome = Winner
        ];
      } else {
        return [
          {
            identifier: down.identifier,
            dppmFusdc: Number(formatFusdc(down.dppmFusdc, 2)),
            ninetailsWinnerFusdc: Number(
              formatFusdc(down.ninetailsWinnerFusdc, 2),
            ),
            ninetailsLoserFusd: 0,
          }, //Down outcome = Winner
          {
            identifier: up.identifier,
            dppmFusdc: 0,
            ninetailsWinnerFusdc: 0,
            ninetailsLoserFusd: Number(formatFusdc(up.ninetailsLoserFusd, 2)),
          }, // Up outcome = Looser
        ];
      }
    },
    initialData: outcomes.map((o) => ({
      identifier: o.identifier,
      dppmFusdc: BigInt(0),
      ninetailsLoserFusd: BigInt(0),
      ninetailsWinnerFusdc: BigInt(0),
    })),
    enabled,
  });
}

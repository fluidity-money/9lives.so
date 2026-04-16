import config from "@/config";
import { requestSimpleMarket } from "@/providers/graphqlClient";
import { SimpleMarketKey } from "@/types";
import { useQuery } from "@tanstack/react-query";

type BasePriceMap = Record<string, number>;

export default function useMarketBasePrices() {
  return useQuery<BasePriceMap>({
    queryKey: ["marketBasePrices"],
    queryFn: async () => {
      const markets = Object.values(config.simpleMarkets).filter(
        (m) => m.listed,
      );

      const entries: { key: string; basePrice: number }[] = [];

      await Promise.all(
        markets.flatMap((m) =>
          m.periods.map(async (period) => {
            try {
              const data = await requestSimpleMarket(m.slug, period);
              const priceTarget = data?.priceMetadata?.priceTargetForUp;
              if (priceTarget) {
                entries.push({
                  key: `${m.slug.toLowerCase()}-${period}`,
                  basePrice: Number(priceTarget),
                });
              }
            } catch {
              // Skip failed fetches
            }
          }),
        ),
      );

      return Object.fromEntries(entries.map((e) => [e.key, e.basePrice]));
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

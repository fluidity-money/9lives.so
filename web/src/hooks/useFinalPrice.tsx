import config from "@/config";
import { PricePoint, RawPricePoint, SimpleMarketKey } from "@/types";
import { useQuery } from "@tanstack/react-query";

export default function useFinalPrice({
  symbol,
  starting,
  ending,
}: {
  symbol?: SimpleMarketKey;
  ending: number;
  starting: number;
}) {
  return useQuery<RawPricePoint[], Error, PricePoint>({
    queryKey: ["assetPrices", symbol, starting, ending],
    queryFn: async () => {
      throw new Error(
        "This function should be called. This query is being updated by websocket.",
      );
    },
    select: (data) => {
      if (!symbol) {
        return { price: 0, id: 0, timestamp: 0 };
      }
      return {
        price: Number(
          data[0].amount.toFixed(config.simpleMarkets[symbol].decimals),
        ),
        id: data[0].id,
        timestamp: new Date(data[0].created_by).getTime(),
      };
    },
    enabled: false,
  });
}

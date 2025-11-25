import config from "@/config";
import { requestFinalPrice } from "@/providers/graphqlClient";
import { PricePoint, RawPricePoint } from "@/types";
import { formatAssetPrices } from "@/utils/format/formatAssetPrice";
import { useQuery } from "@tanstack/react-query";

export default function useFinalPrice({
  symbol,
  starting,
  ending,
}: {
  symbol?: keyof typeof config.simpleMarkets;
  ending: number;
  starting: number;
}) {
  return useQuery({
    queryKey: ["finalPrice", symbol, starting, ending],
    queryFn: async () => {
      if (!symbol) return null;
      return await requestFinalPrice(
        symbol,
        new Date(starting).toISOString(),
        new Date(ending).toISOString(),
      );
    },
    select: (data) => formatAssetPrices(data, symbol!)[0],
    enabled: !!symbol,
  });
}

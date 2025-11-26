import { requestFinalPrice } from "@/providers/graphqlClient";
import { SimpleMarketKey } from "@/types";
import { formatAssetPrices } from "@/utils/format/formatAssetPrice";
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

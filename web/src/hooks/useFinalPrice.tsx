import { requestFinalPrice } from "@/providers/graphqlClient";
import { formatAssetPrices } from "@/utils/format/formatAssetPrice";
import { useQuery } from "@tanstack/react-query";

export default function useFinalPrice({
  symbol,
  starting,
  ending,
}: {
  symbol?: string;
  ending: number;
  starting: number;
}) {
  const _symbol = symbol?.toLowerCase();
  return useQuery({
    queryKey: ["finalPrice", _symbol, starting, ending],
    queryFn: async () => {
      if (!_symbol) return null;
      return await requestFinalPrice(
        _symbol,
        new Date(starting).toISOString(),
        new Date(ending).toISOString(),
      );
    },
    select: (data) => formatAssetPrices(data)[0],
    enabled: !!symbol,
  });
}

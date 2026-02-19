import { PricePoint, SimpleMarketKey } from "@/types";
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
  const { data: assetPrices, isLoading } = useQuery<PricePoint[]>({
    queryKey: ["assetPrices", symbol, starting, ending],
    queryFn: async () => {
      throw new Error(
        "This function should be called. This query is being updated by websocket.",
      );
    },
    enabled: false,
  });
  const finalPrice = assetPrices?.[assetPrices.length - 1].price;

  return { data: finalPrice, isLoading };
}

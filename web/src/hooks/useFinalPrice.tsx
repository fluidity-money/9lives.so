import { requestFinalPrice } from "@/providers/graphqlClient";
import { PricePoint, SimpleMarketKey } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function useFinalPrice({
  symbol,
  starting,
  ending,
}: {
  symbol?: SimpleMarketKey;
  ending: number;
  starting: number;
}) {
  const [isEnded, setIsEnded] = useState<boolean>();

  useEffect(() => {
    setIsEnded(Date.now() > ending);
  }, [ending]);

  const { data: assetPrices, isLoading } = useQuery<PricePoint[]>({
    queryKey: ["assetPrices", symbol, starting, ending],
    queryFn: async () => {
      if (Date.now() > ending && symbol) {
        const finalPrice = await requestFinalPrice(symbol, ending);
        return [{ price: Number(finalPrice), id: 0, timestamp: 0 }];
      }
      throw new Error(
        "This function should be called. This query is being updated by websocket.",
      );
    },
    enabled: isEnded && !!symbol,
  });
  const finalPrice = assetPrices?.[assetPrices.length - 1]?.price;

  return { data: finalPrice, isLoading };
}

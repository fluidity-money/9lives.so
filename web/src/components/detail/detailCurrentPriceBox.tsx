"use client";
import { HeaderBox } from "./detailHeaderBox";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PricePoint } from "@/types";
import config from "@/config";

export default function DetailCurrentPriceBox({
  symbol,
  starting,
  ending,
  isEnded,
  initialData,
}: {
  symbol: string;
  ending: number;
  starting: number;
  isEnded: boolean;
  initialData: PricePoint[];
}) {
  const { data } = useInfiniteQuery<PricePoint[]>({
    queryKey: ["assetPrices", symbol, starting, ending],
    initialData: { pages: [initialData], pageParams: [0] },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < config.hasuraMaxQueryItem) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
  });
  const assetPrices = data.pages.flatMap((c) => c);
  const latestPrice = assetPrices[assetPrices.length - 1]?.price;

  return (
    <HeaderBox
      title={isEnded ? "Final Price" : "Current Price"}
      value={`$${latestPrice}`}
    />
  );
}

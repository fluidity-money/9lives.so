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
}: {
  symbol: string;
  ending: number;
  starting: number;
  isEnded: boolean;
}) {
  const { data, isLoading } = useInfiniteQuery<PricePoint[]>({
    queryKey: ["assetPrices", symbol, starting, ending],
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < config.hasuraMaxQueryItem) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
  });
  const assetPrices = data?.pages.flatMap((c) => c);
  const latestPrice = assetPrices?.[assetPrices.length - 1]?.price;

  if (isLoading || !latestPrice)
    return <div className="skeleton flex-1" style={{ height: 66 }} />;

  return (
    <HeaderBox
      title={isEnded ? "Final Price" : "Current Price"}
      value={`$${latestPrice}`}
    />
  );
}

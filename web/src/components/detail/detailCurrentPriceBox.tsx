"use client";
import { HeaderBox } from "./detailHeaderBox";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PricePoint } from "@/types";
import config from "@/config";
import { useEffect, useState } from "react";

export default function DetailCurrentPriceBox({
  symbol,
  starting,
  ending,
}: {
  symbol: string;
  ending: number;
  starting: number;
}) {
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    setIsEnded(Date.now() > ending);
  }, [ending]);

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
    return <div className="skeleton h-[47px] flex-1 md:h-[66px]" />;

  return (
    <HeaderBox
      title={isEnded ? "Final Price" : "Current Price"}
      value={`$${latestPrice}`}
    />
  );
}

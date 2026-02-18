"use client";
import { HeaderBox } from "./headerBox";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
  const { data: assetPrices, isLoading } = useQuery<PricePoint[]>({
    queryKey: ["assetPrices", symbol, starting, ending],

    queryFn: async () => {
      throw new Error(
        "This function should be called. This query is being updated by websocket.",
      );
    },
    enabled: false,
  });
  const latestPrice = assetPrices?.[assetPrices.length - 1]?.price;

  if (isLoading || !latestPrice)
    return <div className="skeleton h-[47px] flex-1 md:h-[66px]" />;

  return (
    <HeaderBox
      title={isEnded ? "Final" : "Current"}
      value={`$${Number(latestPrice).toFixed(2)}`}
    />
  );
}

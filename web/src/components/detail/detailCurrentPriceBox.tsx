"use client";
import { HeaderBox } from "./detailHeaderBox";
import { useQuery } from "@tanstack/react-query";
import { PricePoint } from "@/types";

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
  const { data } = useQuery<PricePoint[]>({
    queryKey: ["assetPrices", symbol, starting, ending],
    initialData,
  });

  const latestPrice = data[data.length - 1]?.price;

  return (
    <HeaderBox
      title={isEnded ? "Final Price" : "Current Price"}
      value={`$${latestPrice}`}
    />
  );
}

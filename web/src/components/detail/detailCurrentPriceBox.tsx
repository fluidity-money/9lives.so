"use client";
import { HeaderBox } from "./detailHeaderBox";
import { useQuery } from "@tanstack/react-query";
import { PricePoint } from "@/types";

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
  const _symbol = symbol.toLowerCase();
  const { data, isSuccess } = useQuery<PricePoint[]>({
    queryKey: ["assetPrices", _symbol, starting, ending],
  });

  if (!isSuccess && !data) return null;

  const latestPrice = data[data.length - 1].price;

  return (
    <HeaderBox
      title={isEnded ? "Final Price" : "Current Price"}
      value={`$${latestPrice}`}
    />
  );
}

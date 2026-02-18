"use client";
import { SimpleMarketKey } from "@/types";
import { HeaderBox } from "./detailHeaderBox";
import useFinalPrice from "@/hooks/useFinalPrice";

export default function DetailCurrentPriceBox({
  symbol,
  starting,
  ending,
  isEnded,
}: {
  symbol: SimpleMarketKey;
  ending: number;
  starting: number;
  isEnded: boolean;
}) {
  const { data: finalPrice, isLoading } = useFinalPrice({
    symbol,
    starting,
    ending,
  });

  if (isLoading || !finalPrice)
    return <div className="skeleton h-[47px] flex-1 md:h-[66px]" />;

  return (
    <HeaderBox
      title={isEnded ? "Final Price" : "Current Price"}
      value={`$${finalPrice}`}
    />
  );
}

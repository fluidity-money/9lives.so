"use client";
import { SimpleMarketKey } from "@/types";
import { HeaderBox } from "./headerBox";
import useFinalPrice from "@/hooks/useFinalPrice";
import config from "@/config";

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
      title={isEnded ? "Final" : "Current"}
      value={`$${Number(finalPrice).toFixed(config.simpleMarkets[symbol].decimals)}`}
    />
  );
}

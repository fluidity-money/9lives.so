"use client";
import config from "@/config";
import { PricePoint, SimpleMarketKey } from "@/types";
import { memo, useMemo } from "react";
import { Liveline } from "liveline";

function AssetPriceChart({
  symbol,
  basePrice,
  starting,
  ending,
  assetPrices,
}: {
  id: string;
  symbol: SimpleMarketKey;
  basePrice: number;
  starting: number;
  ending: number;
  assetPrices: PricePoint[];
}) {
  const chartHeight = 300;
  const decimals = config.simpleMarkets[symbol].decimals;
  const data = useMemo(
    () =>
      assetPrices.map((p) => ({
        time: p.timestamp / 1000,
        value: p.price,
      })),
    [assetPrices],
  );
  const latestPrice =
    assetPrices.length > 0
      ? assetPrices[assetPrices.length - 1].price
      : basePrice;
  const priceIsAbove = latestPrice > basePrice;
  // Trailing window sized to the campaign, so every point stays in
  // view for the market's whole lifetime.
  const windowSecs = Math.max(60, Math.round((ending - starting) / 1000));

  return (
    <div style={{ height: chartHeight }}>
      <Liveline
        data={data}
        value={latestPrice}
        loading={data.length === 0}
        theme="light"
        color={priceIsAbove ? "#16A34A" : "#DC2828"}
        referenceLine={{
          value: basePrice,
          label: `BASE $${basePrice.toFixed(decimals)}`,
        }}
        window={windowSecs}
        grid={false}
        formatValue={(v) => `$${v.toFixed(decimals)}`}
        formatTime={(t) =>
          new Date(t * 1000).toLocaleString("default", {
            hour: "numeric",
            minute: "2-digit",
          })
        }
      />
    </div>
  );
}

// Only re-render the plot when its own inputs change; trades update the
// surrounding campaign object every few seconds and must not touch it.
export default memo(AssetPriceChart);

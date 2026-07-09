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
  // Rows arrive in database commit order, which is not always
  // created_by order, so sort before drawing.
  const data = useMemo(
    () =>
      [...assetPrices]
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((p) => ({
          time: p.timestamp / 1000,
          value: p.price,
        })),
    [assetPrices],
  );
  const latestPrice = data.length > 0 ? data[data.length - 1].value : basePrice;
  const priceIsAbove = latestPrice > basePrice;
  // Liveline's window trails the live edge, so size it to the span
  // of the data we actually have: the first available point sits at
  // the left edge and the line stretches the full width, however
  // little history the websocket delivered. Capped to the campaign
  // duration, with a floor so the first ticks aren't absurdly zoomed.
  const campaignSecs = Math.max(60, Math.round((ending - starting) / 1000));
  const windowSecs = useMemo(() => {
    if (data.length < 2) return 30;
    const span = Math.ceil(data[data.length - 1].time - data[0].time);
    return Math.min(Math.max(30, span), campaignSecs);
  }, [data, campaignSecs]);

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

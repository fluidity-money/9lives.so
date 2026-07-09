"use client";
import config from "@/config";
import { PricePoint, SimpleMarketKey } from "@/types";
import {
  ComposedChart,
  ResponsiveContainer,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

export default function AssetPriceChart({
  symbol,
  basePrice,
  starting,
  ending,
  volume,
  assetPrices,
}: {
  id: string;
  symbol: SimpleMarketKey;
  basePrice: number;
  starting: number;
  ending: number;
  volume: string;
  assetPrices: PricePoint[];
}) {
  const chartHeight = 300;
  if (assetPrices.length < 1) {
    return <div className="skeleton w-full" style={{ height: chartHeight }} />;
  }
  const latestPoint = assetPrices[assetPrices.length - 1];
  const latestPrice = latestPoint.price;
  const latestTimestamp = latestPoint.timestamp;
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
    <ResponsiveContainer width="100%" height={chartHeight}>
      <ComposedChart
        data={uniquePoints}
        margin={{
          top: 43,
          right: -60,
          bottom: -18,
          left: 0,
        }}
      >
        <ReferenceDot x={latestTimestamp} y={latestPrice} shape={Dot} />
        <ReferenceDot
          zIndex={0}
          x={latestTimestamp}
          y={latestPrice}
          shape={PulseDot}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="none"
          fill={priceIsAbove ? "#16A34A" : "#DC2828"}
          fillOpacity={0.15}
          isAnimationActive={false}
          tooltipType="none"
        />
        <Line
          dot={false}
          dataKey={"price"}
          zIndex={99}
          type="monotone"
          stroke={priceIsAbove ? "#16A34A" : "#DC2828"}
          strokeWidth={2}
          name={symbol.toUpperCase()}
        />
        <ReferenceLine
          x={starting}
          strokeWidth={2}
          stroke="rgb(var(--color-neutral-300))"
          strokeDasharray="5 5"
          zIndex={100}
          label={{
            orientation: "bottom",
            value: new Date(starting).toLocaleString("default", {
              day: isDailyMarket ? "numeric" : undefined,
              month: isDailyMarket ? "short" : undefined,
              hour: isDailyMarket ? undefined : "numeric",
              minute: isDailyMarket ? undefined : "2-digit",
            }),
            fontSize: 12,
            fontWeight: "500",
            fill: "rgb(var(--color-neutral-400))",
            position: "insideBottomLeft",
            dx: 0,
            dy: 16,
          }}
        />
        <ReferenceLine
          y={basePrice}
          zIndex={0}
          label={{
            value: `$${basePrice}`,
            position: "centerBottom",
            fill: "rgb(var(--color-neutral-600))",
            dy: 10,
            fontSize: 12,
            fontWeight: "bold",
          }}
        />
        <ReferenceLine
          y={basePrice}
          stroke="rgb(var(--color-neutral-200))"
          strokeWidth={2}
          zIndex={0}
          label={{
            value: "BASE",
            position: "centerBottom",
            fill: "rgb(var(--color-neutral-400))",
            dy: -10,
            fontSize: 12,
            fontWeight: "bold",
          }}
        />
        <YAxis
          tick={{
            fontSize: 12,
            fill: "rgb(var(--color-2black))",
          }}
          domain={[minY, maxY]}
          dataKey="price"
          axisLine={{
            stroke: "rgb(var(--color-neutral-300))",
            strokeWidth: 2,
            strokeDasharray: "5 5",
          }}
          orientation="right"
          tickFormatter={(value) => `$${value}`}
          ticks={[]}
        />
        <XAxis
          tick={{
            fontSize: 12,
            fill: "rgb(var(--color-neutral-400))",
            transform: "translate(-6,-6)",
            fontWeight: "500",
          }}
          type="number"
          scale="time"
          axisLine={false}
          tickLine={false}
          dataKey="timestamp"
          domain={[starting, ending]}
          ticks={[starting, ending]}
          tickFormatter={formatFn}
        />
        <ReferenceDot x={latestTimestamp} y={latestPrice} shape={PriceInd} />
        <Tooltip
          labelFormatter={(ts) => {
            const date = new Date(ts);
            return date.toLocaleString("default", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          }}
          formatter={(c) => `$${c}`}
          contentStyle={{
            padding: 4,
            borderRadius: 8,
            backgroundColor: "rgba(24, 24, 24, 0.36)",
            backdropFilter: "blur(2px)",
          }}
          labelStyle={{ fontSize: 10, color: "#F5F5F5", fontWeight: "500" }}
          itemStyle={{
            fontSize: 12,
            marginTop: 4,
            padding: "2px 4px",
            fontWeight: "bold",
            backgroundColor: "#F5F5F5",
            borderRadius: 12,
          }}
        />
      </ComposedChart>
      <span className="absolute inset-x-0 -bottom-1 block text-center text-xs text-neutral-400">
        ${volume} Vol.
      </span>
    </ResponsiveContainer>
  );
}

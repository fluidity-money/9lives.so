"use client";

import ChartPriceProvider from "@/providers/chartPriceProvider";
import { requestAssetPrice } from "@/providers/graphqlClient";
import { PricePoint, PricePointResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

export default function AssetPriceChart({
  id,
  symbol,
  basePrice,
  starting,
  ending,
}: {
  id: string;
  symbol: string;
  basePrice: number;
  starting: number;
  ending: number;
}) {
  const { data, isSuccess } = useQuery<PricePoint[]>({
    queryKey: ["assetPrice", symbol, id],
    queryFn: async () => {
      const res = await requestAssetPrice(
        symbol.toUpperCase(),
        new Date(starting).toISOString(),
      );
      if (res?.oracles_ninelives_prices_1) {
        return res?.oracles_ninelives_prices_1.map((i) => ({
          price: i.amount,
          id: i.id,
          timestamp: new Date(i.created_by).getTime(),
        }));
      }
      return [];
    },
  });

  if (!isSuccess || data.length < 2) {
    return null;
  }
  const latestPrice = data[data.length - 1].price;
  const minTs = starting;
  const maxTs = ending;
  const durationSeconds = maxTs - minTs;
  const durationDays = durationSeconds / 86400 / 1000;
  const priceIsAbove = latestPrice > basePrice;

  const formatFn = (ts: number) => {
    const date = new Date(ts);
    if (durationDays <= 1) {
      return date.toLocaleString("default", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (durationDays <= 30) {
      return date.toLocaleString("default", { day: "numeric", month: "short" });
    } else {
      return date.toLocaleString("default", { month: "short" });
    }
  };

  const tickValues: number[] = [];
  let lastLabel: string | null = null;
  data.forEach((d) => {
    const label = formatFn(d.timestamp);
    if (label !== lastLabel) {
      tickValues.push(d.timestamp);
      lastLabel = label;
    }
  });
  const prices = data.map((i) => i.price);
  const minPrice = Math.min(...prices, basePrice);
  const maxPrice = Math.max(...prices, basePrice);
  const digits = minPrice.toString().length;
  const margin = 1 / Math.pow(10, digits - 2);
  const minY = minPrice - minPrice * margin;
  const maxY = maxPrice + maxPrice * margin;

  return (
    <ChartPriceProvider id={id} symbol={symbol}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 60, bottom: 5, left: 30 }}
        >
          <ReferenceLine
            y={basePrice}
            stroke="#aaa"
            strokeDasharray="3 3"
            label={{
              value: "BASELINE",
              position: "centerBottom",
              fill: "#aaa",
              dy: 16,
              fontSize: 12,
              fontFamily: "var(--font-geneva)",
            }}
          />
          <Line
            dot={false}
            dataKey={"price"}
            type="monotone"
            stroke={priceIsAbove ? "#5dd341" : "#f96565"}
            strokeWidth={2}
            name={priceIsAbove ? "Above" : "Below"}
          />
          <YAxis
            tick={{
              fontFamily: "var(--font-chicago)",
              fontSize: 12,
              fill: "#0C0C0C",
            }}
            domain={[minY, maxY]}
            dataKey={"price"}
            axisLine={{ stroke: "#0C0C0C", strokeWidth: 1 }}
            orientation="right"
            width="auto"
            tickFormatter={(value) => `$${value}`}
          />
          <XAxis
            tick={{
              fontFamily: "var(--font-chicago)",
              fontSize: 12,
              fill: "#0C0C0C",
            }}
            dataKey="timestamp"
            axisLine={{ stroke: "#0C0C0C", strokeWidth: 1 }}
            ticks={[starting, ...tickValues, ending]}
            tickFormatter={formatFn}
          />
          <Tooltip
            labelFormatter={(ts: any) => {
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
              borderColor: "#0C0C0C",
              borderRadius: 3,
              boxShadow: "5px 5px 0 rgba(12, 12, 12, 0.20)",
            }}
            labelStyle={{ fontFamily: "var(--font-chicago)", fontSize: 12 }}
            itemStyle={{ fontFamily: "var(--font-chicago)", fontSize: 12 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartPriceProvider>
  );
}

"use client";

import ChartPriceProvider from "@/providers/chartPriceProvider";
import { requestAssetPrice } from "@/providers/graphqlClient";
import { PricePoint } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

export default function AssetPriceChart({
  id,
  symbol,
  basePrice,
  starting,
  ending,
  simple = false,
}: {
  id: string;
  symbol: string;
  basePrice: number;
  starting: number;
  ending: number;
  simple?: boolean;
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
          timestamp:
            new Date(i.created_by).getTime() -
            new Date().getTimezoneOffset() * 60 * 1000,
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
        hour: "numeric",
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
  if (!simple) {
    data.forEach((d) => {
      const label = formatFn(d.timestamp);
      if (label !== lastLabel) {
        tickValues.push(d.timestamp);
        lastLabel = label;
      }
    });
  }
  const prices = data.map((i) => i.price);
  const minPrice = Math.min(...prices, basePrice);
  const maxPrice = Math.max(...prices, basePrice);
  const simpleDiff = Math.max(basePrice - minPrice, basePrice - maxPrice);
  const digits = minPrice.toString().length;
  const margin = 1 / Math.pow(10, digits - 2);
  const minY = simple
    ? basePrice - simpleDiff
    : Math.floor(minPrice - minPrice * margin);
  const maxY = simple
    ? basePrice + simpleDiff
    : Math.floor(maxPrice + maxPrice * margin);
  const PulseDot = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <circle
        cx={cx}
        r="10"
        cy={cy}
        fill={priceIsAbove ? "#B8F2AA" : "#FFB3B3"}
      >
        <animate
          attributeName="r"
          from="8"
          to="20"
          dur="1.5s"
          begin="0s"
          repeatCount="indefinite"
        />
      </circle>
    );
  };
  return (
    <ChartPriceProvider id={id} symbol={symbol}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: simple ? 0 : 12,
            right: simple ? 0 : 4,
            bottom: 0,
            left: 0,
          }}
        >
          <ReferenceDot
            x={data[data.length - 1].timestamp}
            y={data[data.length - 1].price}
            shape={PulseDot}
          />
          <ReferenceLine
            y={data[data.length - 1].price}
            stroke="tranparent"
            label={{
              value: `${priceIsAbove ? "▲" : "▼"} $${data[data.length - 1].price}`,
              position: "right",
              fill: priceIsAbove ? "#5dd341" : "#f96565",
              fontSize: 12,
              fontWeight: "bold",
              fontFamily: "var(--font-chicago)",
              transform: "translate(-100, -15)",
            }}
          />
          <ReferenceLine
            y={basePrice}
            label={{
              value: `$${basePrice}`,
              position: "centerBottom",
              color: "#000",
              dy: -10,
              fontSize: 12,
              fontWeight: "bold",
              fontFamily: "var(--font-chicago)",
            }}
          />
          <ReferenceLine
            y={basePrice}
            stroke="#aaa"
            strokeDasharray="3 3"
            label={{
              value: "PRICE TO BEAT",
              position: "centerBottom",
              fill: "#aaa",
              dy: 10,
              fontSize: 10,
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
          {simple ? (
            <YAxis
              yAxisId="1"
              dataKey={"price"}
              axisLine={{
                stroke: "#0C0C0C",
                strokeWidth: 1,
                strokeDasharray: "3 2",
              }}
              orientation="left"
              ticks={[]}
            />
          ) : null}
          <YAxis
            tick={{
              fontFamily: "var(--font-chicago)",
              fontSize: 12,
              fill: "#0C0C0C",
            }}
            yAxisId="0"
            domain={[minY, maxY]}
            dataKey={"price"}
            axisLine={{
              stroke: "#0C0C0C",
              strokeWidth: 1,
              strokeDasharray: simple ? "3 2" : undefined,
            }}
            orientation="right"
            tickFormatter={(value) => `$${value}`}
            ticks={simple ? [] : [minY, basePrice, maxY]}
          />
          <XAxis
            tick={{
              fontFamily: "var(--font-chicago)",
              fontSize: 12,
              fill: "#0C0C0C",
            }}
            type={simple ? "number" : "category"}
            dataKey="timestamp"
            axisLine={{ stroke: "#0C0C0C", strokeWidth: simple ? 0 : 1 }}
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

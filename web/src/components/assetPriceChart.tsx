"use client";

import ChartPriceProvider from "@/providers/chartPriceProvider";
import { requestAssetPrice } from "@/providers/graphqlClient";
import { PricePoint } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  ResponsiveContainer,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";

export default function AssetPriceChart({
  id,
  symbol,
  starting,
  ending,
}: {
  id: string;
  symbol: string;
  starting: number;
  ending: number;
}) {
  const { data, isSuccess } = useQuery<PricePoint[]>({
    queryKey: ["assetPrice", symbol, id],
    queryFn: async () => {
      const res = (await requestAssetPrice(
        symbol,
        new Date(starting).toISOString(),
      )) as { data?: { oracles_ninelives_prices_1?: PricePoint[] } };
      return res?.data?.oracles_ninelives_prices_1 ?? [];
    },
  });

  if (!isSuccess || data.length < 2) {
    return null;
  }

  const minTs = starting;
  const maxTs = ending;
  const durationSeconds = maxTs - minTs;
  const durationDays = durationSeconds / 86400;

  const formatFn = (ts: number) => {
    const date = new Date(ts * 1000);
    if (durationDays <= 1) {
      return date.toLocaleString("default", { hour: "2-digit" });
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

  return (
    <ChartPriceProvider
      id={id}
      symbol={symbol}
      starting={new Date(starting).toUTCString()}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 40, bottom: 5, left: 0 }}
        >
          <CartesianGrid stroke="#aaa" strokeDasharray="1 3" vertical={false} />
          <Line
            dot={false}
            type="monotone"
            stroke={"#5dd341"}
            strokeWidth={2}
            name={"Up"}
          />
          <YAxis
            tick={{
              fontFamily: "var(--font-chicago)",
              fontSize: 12,
              fill: "#0C0C0C",
            }}
            axisLine={{ stroke: "#0C0C0C", strokeWidth: 1 }}
            orientation="right"
            width="auto"
            tickFormatter={(value) => `${value}%`}
          />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ fontFamily: "var(--font-chicago)", fontSize: 12 }}
          />
          <XAxis
            tick={{
              fontFamily: "var(--font-chicago)",
              fontSize: 12,
              fill: "#0C0C0C",
            }}
            dataKey="timestamp"
            axisLine={{ stroke: "#0C0C0C", strokeWidth: 1 }}
            ticks={tickValues}
            tickFormatter={formatFn}
          />
          <Tooltip
            labelFormatter={(ts: any) => {
              const date = new Date(ts * 1000);
              return date.toLocaleString("default", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
            }}
            formatter={(c) => `${c}%`}
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

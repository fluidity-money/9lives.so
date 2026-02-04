"use client";
import config from "@/config";
import { useWSForPrices } from "@/hooks/useWSForPrices";
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
import ChartPointsIndicator from "./chartPointsIndicator";

export default function AssetPriceChart({
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
  useWSForPrices({ asset: symbol, ending, starting });
  if (assetPrices.length < 1) {
    return <div className="skeleton w-full" style={{ height: chartHeight }} />;
  }
  const latestPoint = assetPrices[assetPrices.length - 1];
  const latestPrice = latestPoint.price;
  const latestTimestamp = latestPoint.timestamp;
  const priceIsAbove = latestPrice > basePrice;
  const timeDiff = ending - starting;
  const MIN = 1000 * 60;
  const HOUR = MIN * 60;
  const DAY = HOUR * 24;
  const MONTH = DAY * 30;
  const YEAR = MONTH * 12;
  const prices = assetPrices.map((i) => i.price);
  const minPrice = Math.min(...prices, basePrice);
  const maxPrice = Math.max(...prices, basePrice);
  const simpleDiff = Math.max(
    Math.abs(basePrice - minPrice),
    Math.abs(basePrice - maxPrice),
  );
  const minY = basePrice - simpleDiff;
  const maxY = basePrice + simpleDiff;
  const isDailyMarket = DAY >= timeDiff && timeDiff > HOUR;
  const remainingMs = Math.max(0, ending - latestTimestamp);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatFn = (ts: number) => {
    const date = new Date(ts);
    switch (true) {
      case timeDiff > MONTH:
        return date.toLocaleString("default", {
          month: "short",
          year: timeDiff > YEAR ? "2-digit" : undefined,
        });
      case MONTH >= timeDiff && timeDiff > DAY:
        return date.toLocaleString("default", {
          day: "numeric",
          month: "short",
        });
      case isDailyMarket:
        return date.toLocaleString("default", {
          day: "numeric",
          month: "short",
        });
      default:
        return date.toLocaleString("default", {
          hour: "numeric",
          minute: "2-digit",
        });
    }
  };
  const pointsData = [
    { id: 1, timestamp: starting, price: basePrice },
    ...assetPrices,
  ];
  const uniquePoints = Array.from(
    new Map(pointsData.map((p) => [p.timestamp, p])).values(),
  );

  const PulseDot = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <circle
        cx={cx}
        r="10"
        cy={cy}
        fill={priceIsAbove ? "#DCFCE7" : "#fecaca"}
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

  const Dot = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <circle
        cx={cx}
        r="4"
        cy={cy}
        stroke="#fff"
        strokeWidth={2}
        fill={priceIsAbove ? "#16A34A" : "#DC2828"}
      />
    );
  };

  const PriceInd = ({ cx, cy }: { cx: number; cy: number }) => (
    <g transform="translate(0,-32)">
      <rect
        x={cx - 45}
        y={cy - 10}
        width={90}
        height={20}
        fill={priceIsAbove ? "#16A34A" : "#DC2828"}
        rx={8}
        stroke={priceIsAbove ? "#16A34A" : "#DC2828"}
        strokeWidth={1}
      />
      <rect
        x={cx - 41}
        y={cy - 3.5}
        width={6}
        height={6}
        fill={priceIsAbove ? "#16A34A" : "#DC2828"}
        stroke="#FFF"
        strokeWidth={1}
        rx={3}
      />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={"#FFF"}
      >
        ${latestPrice.toFixed(config.simpleMarkets[symbol].decimals)}
      </text>
    </g>
  );

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
          stroke="#D4D4D4"
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
            fill: "#A3A3A3",
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
            fill: "#525252",
            dy: 10,
            fontSize: 12,
            fontWeight: "bold",
          }}
        />
        <ReferenceLine
          y={basePrice}
          stroke="#E5E5E5"
          strokeWidth={2}
          zIndex={0}
          label={{
            value: "BASE",
            position: "centerBottom",
            fill: "#A3A3A3",
            dy: -10,
            fontSize: 12,
            fontWeight: "bold",
          }}
        />
        <YAxis
          tick={{
            fontSize: 12,
            fill: "#0C0C0C",
          }}
          domain={[minY, maxY]}
          dataKey="price"
          axisLine={{
            stroke: "#D4D4D4",
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
            fill: "#A3A3A3",
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
          labelFormatter={(ts: number) => {
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
    </ResponsiveContainer>
  );
}

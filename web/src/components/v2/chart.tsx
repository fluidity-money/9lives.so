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
  const tickValues: number[] = [];
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
        fill={priceIsAbove ? "#DCFCE7" : "#fecaca"}
        rx={4}
        stroke={priceIsAbove ? "#16A34A" : "#DC2828"}
        strokeWidth={1}
      />
      <rect
        x={cx - 41}
        y={cy - 3.5}
        width={6}
        height={6}
        fill={priceIsAbove ? "#16A34A" : "#DC2828"}
        rx={3}
      />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={priceIsAbove ? "#16A34A" : "#DC2828"}
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
          top: 42,
          right: -60,
          bottom: 8,
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
        <ReferenceLine x={latestTimestamp} strokeWidth={2} stroke="#181818" />
        <ReferenceLine
          x={starting}
          strokeWidth={1}
          stroke="#0C0C0C"
          strokeDasharray="3 2"
          label={{
            orientation: "top",
            value: new Date(starting).toLocaleString("default", {
              day: isDailyMarket ? "numeric" : undefined,
              month: isDailyMarket ? "short" : undefined,
              hour: isDailyMarket ? undefined : "numeric",
              minute: isDailyMarket ? undefined : "2-digit",
            }),
            fontSize: 12,
            fill: "#A3A3A3",
            position: "insideBottomLeft",
            dx: -4,
            dy: -223,
          }}
        />
        <ReferenceLine
          y={basePrice}
          zIndex={0}
          label={{
            value: `$${basePrice}`,
            position: "centerBottom",
            color: "#737373",
            dy: 10,
            fontSize: 12,
            fontWeight: "semibold",
          }}
        />
        <ReferenceLine
          y={basePrice}
          stroke="#D4D4D4"
          strokeWidth={2}
          zIndex={0}
          label={{
            value: "BASE",
            position: "centerBottom",
            fill: "#D4D4D4",
            dy: -10,
            fontSize: 10,
            fontWeight: "bold",
          }}
        />
        <YAxis
          tick={{
            fontSize: 12,
            fill: "#0C0C0C",
          }}
          domain={[minY, maxY]}
          dataKey={"price"}
          axisLine={{
            stroke: "#0C0C0C",
            strokeWidth: 1,
            strokeDasharray: "3 2",
          }}
          orientation="right"
          tickFormatter={(value) => `$${value}`}
          ticks={[]}
        />
        <XAxis
          tick={{
            fontSize: 12,
            fill: "#A3A3A3",
            transform: "translate(-6,0)",
          }}
          orientation="top"
          type="number"
          scale="time"
          axisLine={false}
          tickLine={false}
          dataKey="timestamp"
          domain={[starting, ending]}
          ticks={[starting, ending]}
          tickFormatter={formatFn}
        />
        <ReferenceLine
          segment={[
            { x: starting, y: maxY },
            { x: latestTimestamp, y: maxY },
          ]}
          stroke="#181818"
          strokeWidth={2}
          ifOverflow="extendDomain"
        />
        <ReferenceLine
          segment={[
            { x: latestTimestamp, y: maxY },
            { x: ending, y: maxY },
          ]}
          stroke="#D4D4D4"
          strokeWidth={2}
          ifOverflow="extendDomain"
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
            borderColor: "#0C0C0C",
            borderRadius: 3,
            boxShadow: "5px 5px 0 rgba(12, 12, 12, 0.20)",
          }}
          labelStyle={{ fontSize: 12 }}
          itemStyle={{ fontSize: 12 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

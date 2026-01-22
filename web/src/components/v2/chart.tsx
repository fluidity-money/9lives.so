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
  const timeleft = ending - latestTimestamp;
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

  const CountdownInd = ({ cx, cy }: { cx: number; cy: number }) => (
    <g transform="translate(0,-0)">
      <rect
        x={cx - 32}
        y={cy - 10}
        width={74}
        height={20}
        fill="#FDBA72"
        rx={10}
        stroke="#181818"
        strokeWidth={1}
      />
      <svg
        x={cx - 26}
        y={cy - 6}
        width="9"
        height="11"
        viewBox="0 0 9 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.5 1.5C3.60999 1.5 2.73996 1.76392 1.99994 2.25839C1.25991 2.75285 0.683138 3.45566 0.342544 4.27793C0.00194979 5.10019 -0.0871652 6.00499 0.0864683 6.87791C0.260102 7.75082 0.688685 8.55264 1.31802 9.18198C1.94736 9.81132 2.74918 10.2399 3.6221 10.4135C4.49501 10.5872 5.39981 10.4981 6.22208 10.1575C7.04434 9.81686 7.74715 9.24009 8.24162 8.50007C8.73608 7.76005 9 6.89002 9 6C8.99864 4.80694 8.52409 3.66315 7.68048 2.81953C6.83686 1.97591 5.69306 1.50136 4.5 1.5ZM6.64032 4.39031L4.76532 6.26531C4.73047 6.30015 4.68911 6.32779 4.64359 6.34665C4.59807 6.3655 4.54928 6.37521 4.5 6.37521C4.45073 6.37521 4.40194 6.3655 4.35642 6.34665C4.31089 6.32779 4.26953 6.30015 4.23469 6.26531C4.19985 6.23047 4.17221 6.18911 4.15335 6.14359C4.1345 6.09806 4.12479 6.04927 4.12479 6C4.12479 5.95073 4.1345 5.90194 4.15335 5.85641C4.17221 5.81089 4.19985 5.76953 4.23469 5.73469L6.10969 3.85969C6.14453 3.82485 6.18589 3.79721 6.23142 3.77835C6.27694 3.7595 6.32573 3.74979 6.375 3.74979C6.42428 3.74979 6.47307 3.7595 6.51859 3.77835C6.56411 3.79721 6.60547 3.82485 6.64032 3.85969C6.67516 3.89453 6.70279 3.93589 6.72165 3.98141C6.74051 4.02694 6.75021 4.07573 6.75021 4.125C6.75021 4.17427 6.74051 4.22306 6.72165 4.26859C6.70279 4.31411 6.67516 4.35547 6.64032 4.39031ZM3 0.375C3 0.275544 3.03951 0.180161 3.10984 0.109835C3.18016 0.0395088 3.27555 0 3.375 0H5.625C5.72446 0 5.81984 0.0395088 5.89017 0.109835C5.96049 0.180161 6 0.275544 6 0.375C6 0.474456 5.96049 0.569839 5.89017 0.640165C5.81984 0.710491 5.72446 0.75 5.625 0.75H3.375C3.27555 0.75 3.18016 0.710491 3.10984 0.640165C3.03951 0.569839 3 0.474456 3 0.375Z"
          fill="#181818"
        />
      </svg>
      <text
        x={cx + 10}
        y={cy + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#181818"
      >
        {`${new Date(timeleft).toLocaleString("default", { minute: "numeric" }).padStart(2, "0")}M:${new Date(timeleft).toLocaleString("default", { second: "2-digit" }).padStart(2, "0")}S`}
      </text>
    </g>
  );

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <ComposedChart
        data={uniquePoints}
        margin={{
          top: 14,
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
        <ReferenceLine x={latestTimestamp} strokeWidth={2} stroke="#181818" />
        <ReferenceLine
          x={starting}
          strokeWidth={2}
          stroke="#D4D4D4"
          strokeDasharray="5 5"
          zIndex={100}
          label={{
            orientation: "top",
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
            dx: -4,
            dy: -257,
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
            fontWeight: "600",
          }}
        />
        <ReferenceLine
          y={basePrice}
          stroke="transparent"
          ifOverflow="extendDomain"
          shape={({ x1, x2, y1 }) => (
            <ChartPointsIndicator
              starting={starting}
              ending={ending}
              x1={x1}
              x2={x2}
              y1={y1}
            />
          )}
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
        <ReferenceDot x={latestTimestamp} y={maxY} shape={CountdownInd} />
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

import ChartPriceProvider from "@/providers/chartPriceProvider";
import { PricePoint } from "@/types";
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
  symbol,
  basePrice,
  starting,
  ending,
  assetPrices,
  assetsLoaded,
  simple = false,
}: {
  id: string;
  symbol: string;
  basePrice: number;
  starting: number;
  ending: number;
  simple?: boolean;
  assetsLoaded: boolean;
  assetPrices?: PricePoint[];
}) {
  if (!assetsLoaded || !assetPrices || assetPrices.length < 2) {
    return null;
  }
  const latestPoint = assetPrices?.[assetPrices.length - 1];
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
  const digits = minPrice.toString().length;
  const margin = 1 / Math.pow(10, digits - 2);
  const minY = simple
    ? basePrice - simpleDiff
    : Math.floor(minPrice - minPrice * ((simple ? 1 : 6) * margin));
  const maxY = simple
    ? basePrice + simpleDiff
    : Math.floor(maxPrice + maxPrice * margin);

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
      case DAY >= timeDiff && timeDiff > HOUR:
        return date.toLocaleString("default", { hour: "numeric" });
      default:
        return date.toLocaleString("default", {
          hour: "numeric",
          minute: "2-digit",
        });
    }
  };

  if (!simple) {
    let divider;
    switch (true) {
      case timeDiff > MONTH:
        divider = MONTH;
        break;
      case MONTH >= timeDiff && timeDiff > DAY:
        divider = 5 * DAY;
        break;
      case DAY >= timeDiff && timeDiff > HOUR:
        divider = HOUR;
        break;
      default:
        divider = 5 * MIN;
        break;
    }
    for (
      let t = starting + divider;
      t < Date.now() && t <= ending;
      t += divider
    ) {
      tickValues.push(t);
    }
  }

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

  const Dot = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <circle
        cx={cx}
        r="4"
        cy={cy}
        stroke="#fff"
        strokeWidth={2}
        fill={priceIsAbove ? "#5dd341" : "#f96565"}
      />
    );
  };

  const PriceInd = ({ cx, cy }: { cx: number; cy: number }) => (
    <g transform="translate(0,-32)">
      <rect
        x={cx - 40}
        y={cy - 10}
        width={80}
        height={20}
        fill={priceIsAbove ? "#5dd341" : "#f96565"}
        rx={4}
      />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={"#fff"}
        fontFamily="var(--font-chicago)"
      >
        {priceIsAbove ? "▲" : "▼"} ${latestPrice}
      </text>
    </g>
  );

  return (
    <ChartPriceProvider starting={starting} ending={ending} symbol={symbol}>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={[
            { id: 1, timestamp: starting, price: basePrice },
            ...assetPrices,
          ]}
          margin={{
            top: 40,
            right: simple ? -60 : 4,
            bottom: simple ? -10 : 0,
            left: 0,
          }}
        >
          <ReferenceDot x={latestTimestamp} y={latestPrice} shape={PulseDot} />
          <ReferenceDot x={latestTimestamp} y={latestPrice} shape={Dot} />
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
            name={symbol.toUpperCase()}
          />
          {simple ? (
            <ReferenceLine
              x={starting}
              strokeWidth={1}
              stroke="#0C0C0C"
              strokeDasharray="3 2"
              label={{
                value: new Date(starting).toLocaleString("default", {
                  hour: "numeric",
                  minute: "2-digit",
                }),
                fontFamily: "var(--font-chicago)",
                fontSize: 12,
                fill: "#0C0C0C",
                position: "insideBottomLeft",
                dx: -4,
                dy: 22,
              }}
            />
          ) : null}
          <YAxis
            tick={{
              fontFamily: "var(--font-chicago)",
              fontSize: 12,
              fill: "#0C0C0C",
            }}
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
              transform: simple ? "translate(-6,0)" : undefined,
            }}
            scale={"time"}
            type={simple ? "number" : "category"}
            dataKey="timestamp"
            domain={[starting, ending]}
            axisLine={{ stroke: "#0C0C0C", strokeWidth: simple ? 0 : 1 }}
            ticks={simple ? [starting, ending] : [starting, ...tickValues]}
            tickFormatter={formatFn}
          />
          <ReferenceDot x={latestTimestamp} y={latestPrice} shape={PriceInd} />
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

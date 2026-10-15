"use client";

import config from "@/config";
import type { PricePoint } from "@/types";
import { memo, useId, useMemo, useState } from "react";
import type { RfqhubIncomingRequest } from "@/lib/rfqhubRequests";
import {
  RFQHUB_CHART_RANGES,
  type RfqhubChartRange,
  rfqhubChartGeometry,
  rfqhubChartPositions,
} from "@/lib/rfqhubChart";

function RfqhubPriceChart({
  prices,
  requests = [],
}: {
  prices: PricePoint[];
  requests?: RfqhubIncomingRequest[];
}) {
  const [range, setRange] = useState<RfqhubChartRange>("1m");
  const clipId = useId();
  const positions = useMemo(() => rfqhubChartPositions(requests), [requests]);
  const { data, latest, start, end, min, max, x, y } = useMemo(
    () => rfqhubChartGeometry(prices, positions, range),
    [prices, positions, range],
  );
  const money = (price: number) =>
    `$${price.toFixed(config.simpleMarkets.btc.decimals)}`;
  const time = (value: number) =>
    new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const visiblePositions = positions.filter(
    (p) =>
      latest &&
      p.start <= end &&
      p.end >= start &&
      p.target >= min &&
      p.target <= max,
  );
  return (
    <div className="min-w-0">
      <div
        role="group"
        aria-label="Chart time range"
        className="flex justify-end gap-1"
      >
        {RFQHUB_CHART_RANGES.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={range === value}
            onClick={() => setRange(value)}
            className={`rounded px-3 py-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${range === value ? "bg-neutral-200 text-neutral-900" : "text-neutral-600 hover:bg-neutral-100"}`}
          >
            {value}
          </button>
        ))}
      </div>
      <svg
        viewBox="0 0 800 290"
        role="img"
        aria-label="Live BTC price with RFQ request targets and expiry endpoints"
        className="block w-full"
        data-range={range}
      >
        <title>
          BTC oracle prices and observed RFQ requests (not confirmed fills)
        </title>
        <defs>
          <clipPath id={clipId}>
            <rect x={90} y={30} width={660} height={215} />
          </clipPath>
        </defs>
        {[min, (min + max) / 2, max].map((value) => (
          <g key={value}>
            <line
              x1={90}
              x2={750}
              y1={y(value)}
              y2={y(value)}
              stroke="#d4d4d4"
              strokeDasharray="2 4"
            />
            <text
              x={82}
              y={y(value) + 4}
              textAnchor="end"
              fontSize={12}
              fill="#525252"
            >
              {money(value)}
            </text>
          </g>
        ))}
        {latest &&
          [start, (start + end) / 2, end].map((value) => (
            <text
              key={value}
              x={x(value)}
              y={275}
              textAnchor="middle"
              fontSize={12}
              fill="#525252"
            >
              {time(value)}
            </text>
          ))}
        <g clipPath={`url(#${clipId})`}>
          {visiblePositions.map((position) => {
            const label = `Request #${position.id} · ${position.isUp ? "Above" : "Below"} ${money(position.target)} · Ends ${new Date(position.end).toLocaleString()}`;
            const color = position.isUp ? "#2563eb" : "#9333ea";
            const showEnd = position.end >= start && position.end <= end;
            return (
              <g key={position.id} role="img" aria-label={label} tabIndex={0}>
                <title>{label}</title>
                <line
                  data-testid="position-segment"
                  x1={x(Math.max(start, position.start))}
                  x2={x(Math.min(end, position.end))}
                  y1={y(position.target)}
                  y2={y(position.target)}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                {showEnd && (
                  <>
                    <circle
                      data-testid="position-end"
                      cx={x(position.end)}
                      cy={y(position.target)}
                      r={5}
                      fill={color}
                      stroke="white"
                      strokeWidth={2}
                    />
                    <text
                      x={x(position.end) - 8}
                      y={y(position.target) - 8}
                      textAnchor="end"
                      fontSize={12}
                      fill={color}
                    >
                      #{position.id} {position.isUp ? "↑" : "↓"}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          <path
            data-testid="oracle-path"
            d={data
              .map((p, i) => `${i ? "L" : "M"}${x(p.timestamp)},${y(p.price)}`)
              .join(" ")}
            fill="none"
            stroke="#16a34a"
            strokeWidth={2}
          />
          {latest && (
            <circle
              data-testid="oracle-end"
              cx={x(latest.timestamp)}
              cy={y(latest.price)}
              r={3}
              fill="#16a34a"
            >
              <title>
                Latest BTC: {money(latest.price)} at {time(latest.timestamp)}
              </title>
            </circle>
          )}
        </g>
      </svg>
      {!latest && (
        <p className="text-xs text-neutral-600">Waiting for live BTC prices</p>
      )}
    </div>
  );
}

export default memo(RfqhubPriceChart);

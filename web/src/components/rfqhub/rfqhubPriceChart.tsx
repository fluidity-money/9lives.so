"use client";

import config from "@/config";
import type { PricePoint } from "@/types";
import { Liveline } from "liveline";
import { memo, useMemo } from "react";

import type { RfqhubIncomingRequest } from "@/lib/rfqhubRequests";
import { rfqhubChartGeometry, rfqhubChartPositions } from "@/lib/rfqhubChart";

function RfqhubPriceChart({
  prices,
  requests = [],
}: {
  prices: PricePoint[];
  requests?: RfqhubIncomingRequest[];
}) {
  const positions = useMemo(() => rfqhubChartPositions(requests), [requests]);
  const data = useMemo(
    () =>
      prices.map((point) => ({
        time: point.timestamp / 1000,
        value: point.price,
      })),
    [prices],
  );
  const latest = data[data.length - 1];
  const windowSecs =
    data.length < 2
      ? 30
      : Math.min(900, Math.max(30, Math.ceil(latest.time - data[0].time)));
  // Liveline 0.0.7 exposes only one unbounded reference line and no shared
  // overlay scales. Use SVG for annotated data rather than guessing pixels.
  if (positions.length) {
    const {
      data: points,
      latest: last,
      start,
      end,
      min,
      max,
      x,
      y,
    } = rfqhubChartGeometry(prices, positions);
    const money = (price: number) =>
      `$${price.toFixed(config.simpleMarkets.btc.decimals)}`;
    const time = (value: number) =>
      new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    const label = (position: (typeof positions)[number]) =>
      `Request #${position.id} · ${position.isUp ? "Above" : "Below"} ${money(position.target)} · Ends ${new Date(position.end).toLocaleString()}`;
    return (
      <div>
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 800 290"
            role="img"
            aria-label="Live BTC price with RFQ request targets and expiry endpoints"
            className="w-full min-w-[480px]"
            style={{ minHeight: 260 }}
          >
            <title>
              BTC oracle prices and observed RFQ requests (not confirmed fills)
            </title>
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
            {[start, (start + end) / 2, end].map((value) => (
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
            <path
              data-testid="oracle-path"
              d={points
                .map(
                  (p, i) => `${i ? "L" : "M"}${x(p.timestamp)},${y(p.price)}`,
                )
                .join(" ")}
              fill="none"
              stroke="#16a34a"
              strokeWidth={2}
            />
            {last && (
              <circle
                data-testid="oracle-end"
                cx={x(last.timestamp)}
                cy={y(last.price)}
                r={4}
                fill="#16a34a"
              >
                <title>
                  Latest BTC: {money(last.price)} at {time(last.timestamp)}
                </title>
              </circle>
            )}
            {positions.map((position) => (
              <g
                key={position.id}
                role="img"
                aria-label={label(position)}
                tabIndex={0}
              >
                <title>{label(position)}</title>
                <line
                  data-testid="position-segment"
                  x1={x(position.start)}
                  x2={x(position.end)}
                  y1={y(position.target)}
                  y2={y(position.target)}
                  stroke={position.isUp ? "#2563eb" : "#9333ea"}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                <circle
                  data-testid="position-end"
                  cx={x(position.end)}
                  cy={y(position.target)}
                  r={5}
                  fill={position.isUp ? "#2563eb" : "#9333ea"}
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={x(position.end) - 8}
                  y={y(position.target) - 8}
                  textAnchor="end"
                  fontSize={12}
                  fill={position.isUp ? "#2563eb" : "#9333ea"}
                >
                  #{position.id} {position.isUp ? "↑" : "↓"}
                </text>
              </g>
            ))}
          </svg>
        </div>
        {!last && (
          <p className="text-xs text-neutral-600">
            Waiting for live BTC prices
          </p>
        )}
        <p className="text-xs text-neutral-600">
          Observed requests, not confirmed fills. Dots mark expiry; dashed lines
          mark targets.
        </p>
        <ul
          className="max-h-28 overflow-y-auto text-xs text-neutral-600"
          aria-label="Chart request details"
        >
          {positions.map((position) => (
            <li key={position.id}>{label(position)}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div style={{ height: 300 }}>
      <Liveline
        data={data}
        value={latest?.value ?? 0}
        loading={!latest}
        theme="light"
        color="#16A34A"
        window={windowSecs}
        grid={false}
        formatValue={(value) =>
          `$${value.toFixed(config.simpleMarkets.btc.decimals)}`
        }
        formatTime={(time) =>
          new Date(time * 1000).toLocaleString("default", {
            hour: "numeric",
            minute: "2-digit",
          })
        }
      />
    </div>
  );
}

export default memo(RfqhubPriceChart);

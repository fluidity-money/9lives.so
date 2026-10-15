import type { PricePoint } from "@/types";
import type { RfqhubIncomingRequest } from "./rfqhubRequests";

export type RfqhubChartPosition = {
  id: string;
  target: number;
  start: number;
  end: number;
  isUp: boolean;
};

// These are observed taker requests, not evidence of filled positions.
export function rfqhubChartPositions(requests: RfqhubIncomingRequest[]) {
  const positions = new Map<string, RfqhubChartPosition>();
  for (const request of requests) {
    const start = Date.parse(request.createdBy);
    const end = Date.parse(request.expiry);
    if (
      request.outcome !== "BitcoinPrice" ||
      !/^\d+$/.test(request.priceTarget) ||
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start
    )
      continue;
    const target = Number(request.priceTarget) / 1_000_000;
    if (!Number.isFinite(target) || target <= 0) continue;
    positions.set(request.id, {
      id: request.id,
      target,
      start,
      end,
      isUp: request.isUp,
    });
  }
  return [...positions.values()];
}

export const RFQHUB_CHART_RANGES = ["1m", "5m", "15m", "All"] as const;
export type RfqhubChartRange = (typeof RFQHUB_CHART_RANGES)[number];
const RANGE_MS = { "1m": 60_000, "5m": 300_000, "15m": 900_000 };

// One shared coordinate system. Only All includes request times; targets never
// influence the price scale and no future oracle samples are manufactured.
export function rfqhubChartGeometry(
  prices: PricePoint[],
  positions: RfqhubChartPosition[],
  range: RfqhubChartRange = "1m",
) {
  const data = prices
    .filter(
      (p) =>
        Number.isFinite(p.timestamp) && Number.isFinite(p.price) && p.price > 0,
    )
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp);
  const latest = data.at(-1);
  const anchor = latest?.timestamp ?? 0;
  const times = [
    anchor,
    ...data.map((p) => p.timestamp),
    ...positions.flatMap((p) => [p.start, p.end]),
  ];
  const duration =
    range === "All"
      ? Math.max(60_000, Math.max(...times) - Math.min(...times))
      : RANGE_MS[range];
  const start = range === "All" ? Math.min(...times) : anchor - duration;
  const end =
    (range === "All" ? Math.max(start + duration, ...times) : anchor) +
    duration * 0.04;
  const recent = data.filter((p) => p.timestamp >= start && p.timestamp <= end);
  const values = recent.map((p) => p.price);
  const low = values.length ? Math.min(...values) : 0;
  const high = values.length ? Math.max(...values) : 1;
  const padding = Math.max((high - low) * 0.12, high * 0.00001, 0.01);
  const min = low - padding;
  const max = high + padding;
  const x = (time: number) => 90 + ((time - start) / (end - start)) * 660;
  const y = (price: number) => 245 - ((price - min) / (max - min)) * 215;
  return { data: recent, latest, start, end, min, max, x, y };
}

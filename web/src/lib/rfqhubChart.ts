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
export const RFQHUB_RANGE_SECS = { "1m": 60, "5m": 300, "15m": 900 };
export const RFQHUB_MIN_WINDOW_SECS = 10;

export function rfqhubSortedPrices(prices: PricePoint[]) {
  return prices
    .filter(
      (p) =>
        Number.isFinite(p.timestamp) && Number.isFinite(p.price) && p.price > 0,
    )
    .sort((a, b) => a.timestamp - b.timestamp);
}

// Seconds of history we hold, which is how wide "All" and the zoom-out
// limit are. Never narrower than 15m so zooming out always does something.
export function rfqhubHistorySecs(data: PricePoint[]) {
  if (data.length < 2) return RFQHUB_RANGE_SECS["15m"];
  const span = (data[data.length - 1].timestamp - data[0].timestamp) / 1000;
  return Math.max(RFQHUB_RANGE_SECS["15m"], Math.ceil(span));
}

export function rfqhubClampWindow(secs: number, data: PricePoint[]) {
  return Math.min(
    Math.max(secs, RFQHUB_MIN_WINDOW_SECS),
    rfqhubHistorySecs(data),
  );
}

// The chart has room for one target line: the open request expiring
// soonest, since that is the one about to settle.
export function rfqhubFocusPosition(
  positions: RfqhubChartPosition[],
  now: number,
) {
  return positions
    .filter((p) => p.start <= now && p.end > now)
    .sort((a, b) => a.end - b.end)[0];
}

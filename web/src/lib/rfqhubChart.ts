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
      request.asset.toUpperCase() !== "BTC" ||
      !/^\d+$/.test(request.priceTarget) ||
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start
    ) continue;
    const target = Number(request.priceTarget) / 1_000_000;
    if (!Number.isFinite(target) || target <= 0) continue;
    positions.set(request.id, { id: request.id, target, start, end, isUp: request.isUp });
  }
  return [...positions.values()];
}

// One coordinate system for both the oracle path and request decorations.
// Future expiry enlarges the domain, never the actual oracle series.
export function rfqhubChartGeometry(prices: PricePoint[], positions: RfqhubChartPosition[]) {
  const data = prices.filter(p => Number.isFinite(p.timestamp) && Number.isFinite(p.price) && p.price > 0)
    .slice().sort((a, b) => a.timestamp - b.timestamp);
  const latest = data.at(-1);
  const recent = latest ? data.filter(p => p.timestamp >= latest.timestamp - 900_000) : [];
  const times = [...recent.map(p => p.timestamp), ...positions.flatMap(p => [p.start, p.end])];
  const values = [...recent.map(p => p.price), ...positions.map(p => p.target)];
  const start = times.length ? Math.min(...times) : 0;
  const end = Math.max(start + 30_000, ...times);
  const low = values.length ? Math.min(...values) : 0;
  const high = values.length ? Math.max(...values) : 1;
  const padding = Math.max((high - low) * 0.12, high * 0.00001, 0.01);
  const min = low - padding;
  const max = high + padding;
  const x = (time: number) => 90 + ((time - start) / (end - start)) * 660;
  const y = (price: number) => 245 - ((price - min) / (max - min)) * 215;
  return { data: recent, latest, start, end, min, max, x, y };
}

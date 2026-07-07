import type { PricePoint } from "@/types";

// CDC delivers price rows in commit order, not created_by order, and a
// snapshot can arrive after live points have already been charted. Keep
// the cache unique by row id and sorted by timestamp so the chart line
// never doubles back on itself.
export default function mergePricePoints(
  previous: PricePoint[] | undefined,
  incoming: PricePoint[],
): PricePoint[] {
  if (!previous || previous.length === 0) {
    return [...incoming].sort((a, b) => a.timestamp - b.timestamp);
  }
  const last = previous[previous.length - 1];
  if (incoming.length === 1 && incoming[0].timestamp > last.timestamp) {
    return [...previous, incoming[0]];
  }
  const byId = new Map<number, PricePoint>();
  for (const p of previous) byId.set(p.id, p);
  for (const p of incoming) byId.set(p.id, p);
  return Array.from(byId.values()).sort((a, b) => a.timestamp - b.timestamp);
}

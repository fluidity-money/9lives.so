import { Outcome } from "@/types";

export default function getDppmPrices(
  odds: Record<string, string> | null,
  outcomes: Outcome[],
) {
  if (!odds) return [];
  const objLen = Object.keys(odds).length;
  if (1 > objLen) {
    return [
      { id: outcomes[0].identifier, price: 0.5 },
      { id: outcomes[1].identifier, price: 0.5 },
    ];
  }
  const _odds = Object.entries(odds);
  const totalShares = _odds.reduce((acc, [_, value]) => acc + Number(value), 0);
  return outcomes.map((o) => ({
    id: o.identifier,
    price: Number(odds[o.identifier.slice(2)] ?? "0") / totalShares,
  }));
}

export default function getDppmPrices(odds: Record<string, string> | null) {
  if (!odds) return [];
  const _odds = Object.entries(odds);
  const totalShares = _odds.reduce((acc, [_, value]) => acc + Number(value), 0);
  return _odds.map(([key, val]) => ({
    id: `0x${key}`,
    price: Number(val) / totalShares,
  }));
}

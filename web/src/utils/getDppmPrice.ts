export default function getDppmPrice(odds: Record<string, string> | null) {
  if (!odds) return [];
  const _odds = Object.entries(odds);
  const totalShares = _odds.reduce(
    (acc, [_, value]) => acc + BigInt(value),
    BigInt(0),
  );
  return _odds.map(([key, val]) => ({
    identifier: `0x${key}`,
    price: Number(BigInt(val) / totalShares),
  }));
}

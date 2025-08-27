type OutcomeId = `0x${string}`;
const SHARE_DECIMALS_EXP = BigInt(1_000_000_000_000_000_000); // adjust to match Rust
type ShareInput = {
  identifier: string;
  shares: string;
} | null;
export default function getAmmPrices(
  sharesArray: ShareInput[],
): Map<OutcomeId, number> | undefined {
  if (!sharesArray) return;
  const filteredArr = sharesArray.filter((s) => s !== null);
  if (2 > filteredArr.length) return;
  const shares: Map<OutcomeId, bigint> = new Map(
    filteredArr.map((item) => [
      `0x${item.identifier}` as OutcomeId,
      BigInt(item.shares),
    ]),
  );
  const outcomeIds = Array.from(shares.keys());
  const weights: Map<OutcomeId, bigint> = new Map();
  // Compute weight for each outcome (product of other shares)
  for (const id of outcomeIds) {
    let weight = BigInt(1);
    for (const other of outcomeIds) {
      if (other !== id) {
        weight *= shares.get(other)!;
      }
    }
    weights.set(id, weight);
  }
  // Compute total weight
  const total = Array.from(weights.values()).reduce(
    (sum, w) => sum + w,
    BigInt(0),
  );
  if (total === BigInt(0)) {
    throw new Error("Total weight is zero");
  }
  // Compute normalized prices
  const prices: Map<OutcomeId, number> = new Map();
  for (const id of outcomeIds) {
    const w = weights.get(id)!;
    // maths::mul_div(weights[i], SHARE_DECIMALS_EXP, total)
    const priceBigInt = (w * SHARE_DECIMALS_EXP) / total;
    prices.set(id, Number(priceBigInt) / Number(SHARE_DECIMALS_EXP));
  }
  return prices;
}

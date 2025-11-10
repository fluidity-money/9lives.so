import { PricePoint, RawAssetPrices, RawPricePoint } from "@/types";

export function formatAssetPrices(ro: RawAssetPrices): PricePoint[] {
  if (!ro) throw new Error("No Asset Price");

  return ro.oracles_ninelives_prices_2.map((i) => formatPricePoint(i));
}

export function formatPricePoint(ro: RawPricePoint): PricePoint {
  return {
    price: ro.amount,
    id: ro.id,
    timestamp:
      new Date(ro.created_by).getTime() -
      new Date().getTimezoneOffset() * 60 * 1000,
  };
}

import config from "@/config";
import {
  PricePoint,
  RawAssetPrices,
  RawPricePoint,
  SimpleMarketKey,
} from "@/types";

export function formatAssetPrices(
  ro: RawAssetPrices,
  token: SimpleMarketKey,
): PricePoint[] {
  if (!ro) throw new Error("No Asset Price");

  return ro.oracles_ninelives_prices_2.map((i) => formatPricePoint(i, token));
}

export function formatPricePoint(
  ro: RawPricePoint,
  token: SimpleMarketKey,
): PricePoint {
  return {
    price: Number(ro.amount.toFixed(config.simpleMarkets[token].decimals)),
    id: ro.id,
    timestamp:
      new Date(ro.created_by).getTime() -
      new Date().getTimezoneOffset() * 60 * 1000,
  };
}

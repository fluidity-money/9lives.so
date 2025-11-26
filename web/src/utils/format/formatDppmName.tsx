import config from "@/config";
import { SimpleMarketKey } from "@/types";

export function formatDppmTitle({
  symbol,
  price,
  end,
}: {
  symbol?: SimpleMarketKey;
  price?: string;
  end: number;
}) {
  if (!symbol || !price) throw new Error("Price metadata is null");

  return `${config.simpleMarkets[symbol].title} above $${Number(price).toFixed(config.simpleMarkets[symbol].decimals)} on ${new Date(end).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", hourCycle: "h23", minute: "2-digit", timeZone: "UTC" })} UTC`;
}

export function formatDppmOutcomeName(name: string) {
  return name.includes("ABOVE") ||
    name.includes("Above") ||
    name.includes("above")
    ? "Up"
    : "Down";
}

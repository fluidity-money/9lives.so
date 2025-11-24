import config from "@/config";
import { requestAssetPrices } from "@/providers/graphqlClient";
import { formatAssetPrices } from "@/utils/format/formatAssetPrice";

export default async function getAndFormatAssetPrices({
  symbol,
  starting,
  ending,
}: {
  symbol: keyof typeof config.simpleMarkets;
  starting: number;
  ending: number;
}) {
  const res = await requestAssetPrices(
    symbol,
    new Date(starting).toISOString(),
    new Date(ending).toISOString(),
  );

  const data = formatAssetPrices(res, symbol);
  return data;
}

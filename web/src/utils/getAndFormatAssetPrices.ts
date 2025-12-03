import { requestAssetPrices } from "@/providers/graphqlClient";
import { SimpleMarketKey } from "@/types";
import { formatAssetPrices } from "@/utils/format/formatAssetPrice";

export default async function getAndFormatAssetPrices({
  symbol,
  starting,
  ending,
  page,
  pageSize,
}: {
  symbol: SimpleMarketKey;
  starting: number;
  ending: number;
  page?: number;
  pageSize?: number;
}) {
  const res = await requestAssetPrices(
    symbol,
    new Date(starting).toISOString(),
    new Date(ending).toISOString(),
    page,
    pageSize,
  );

  const data = formatAssetPrices(res, symbol);
  return data;
}

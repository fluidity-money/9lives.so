import { requestAssetPrice } from "@/providers/graphqlClient";
import { PricePoint } from "@/types";

export default async function getAndFormatAssetPrices({
  symbol,
  starting,
  ending,
}: {
  symbol: string;
  starting: number;
  ending: number;
}) {
  let data: PricePoint[] = [];
  const res = await requestAssetPrice(
    symbol,
    new Date(starting).toISOString(),
    new Date(ending).toISOString(),
  );
  if (res && res.oracles_ninelives_prices_1) {
    data = res?.oracles_ninelives_prices_1.map((i) => ({
      price: i.amount,
      id: i.id,
      timestamp:
        new Date(i.created_by).getTime() -
        new Date().getTimezoneOffset() * 60 * 1000,
    }));
  }
  return data;
}

import config from "@/config";
import { AssetMetadata, EnrichedAssetMetadata, SimpleMarketKey } from "@/types";

const periodMap: Record<
  (typeof config.simpleMarkets.btc.periods)[number],
  string
> = {
  "15mins": "15",
  "5mins": "5",
  hourly: "H",
  daily: "D",
};

export default function enrichAssets(assets?: AssetMetadata[]) {
  if (!assets || assets.length === 0) return [];

  const markets = config.simpleMarkets;

  return assets.reduce<EnrichedAssetMetadata[]>((acc, v) => {
    const market = markets[v.name.toLowerCase() as SimpleMarketKey];
    if (market && market.listed) {
      market.periods.forEach((p) =>
        acc.push({
          ...v,
          period: periodMap[p],
          link: `/campaign/${v.name.toLowerCase()}/${p}`,
        }),
      );
    }
    return acc;
  }, []);
}

import config from "@/config";
import { SimpleCampaignDetail, SimpleMarketPeriod } from "@/types";

export default function getPeriodOfCampaign(
  data: SimpleCampaignDetail,
): SimpleMarketPeriod {
  const baseAsset = data.priceMetadata.baseAsset;
  const market = config.simpleMarkets[baseAsset];
  return data.categories.find((i) =>
    market.periods.includes(i.toLowerCase() as SimpleMarketPeriod),
  )! as SimpleMarketPeriod;
}

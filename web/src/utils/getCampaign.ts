import { periodOrder } from "@/components/v2/assetNav";
import config from "@/config";
import { RawAsset, SimpleMarketKey, SimpleMarketPeriod } from "@/types";

type Params = {
  symbol: SimpleMarketKey;
  period: SimpleMarketPeriod;
};
const prepareCampaign = (assets: RawAsset[]) => {
  const allCamps = Object.values(config.simpleMarkets).reduce(
    (acc, v) => {
      if (v.listed) {
        for (const period of v.periods) {
          acc.push({
            symbol: v.slug as SimpleMarketKey,
            period: period as SimpleMarketPeriod,
          });
        }
      }
      return acc;
    },
    [] as { symbol: SimpleMarketKey; period: SimpleMarketPeriod }[],
  );

  const orderedCamps = allCamps.sort((a, b) => {
    if (
      periodOrder.findIndex((p) => p === a.period) <
      periodOrder.findIndex((p) => p === b.period)
    )
      return -1;
    if (
      periodOrder.findIndex((p) => p === a.period) >
      periodOrder.findIndex((p) => p === b.period)
    )
      return 1;

    const aSpent =
      assets?.find((as) => as.name.toLowerCase() === a.symbol.toLowerCase())
        ?.totalSpent ?? 0;
    const bSpent =
      assets?.find(
        (as) => as.name.toLowerCase() === b.symbol.toLocaleLowerCase(),
      )?.totalSpent ?? 0;
    return bSpent - aSpent;
  });

  return orderedCamps;
};
export const getNextCampaign = ({
  period,
  symbol,
  assets,
}: Params & { assets: RawAsset[] }) => {
  const campaigns = prepareCampaign(assets);
  const currentIdx = campaigns.findIndex(
    (o) => o.period === period && o.symbol === symbol,
  );
  if (currentIdx === campaigns.length - 1)
    return { symbol: campaigns[0].symbol, period: campaigns[0].period };
  return {
    symbol: campaigns[currentIdx + 1].symbol,
    period: campaigns[currentIdx + 1].period,
  };
};
export const getPrevCampaign = ({
  period,
  symbol,
  assets,
}: Params & { assets: RawAsset[] }) => {
  const campaigns = prepareCampaign(assets);
  const currentIdx = campaigns.findIndex(
    (o) => o.period === period && o.symbol === symbol,
  );
  if (currentIdx === 0)
    return {
      symbol: campaigns[campaigns.length - 1].symbol,
      period: campaigns[campaigns.length - 1].period,
    };
  return {
    symbol: campaigns[currentIdx - 1].symbol,
    period: campaigns[currentIdx - 1].period,
  };
};

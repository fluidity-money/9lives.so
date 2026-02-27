import { periodOrder } from "@/components/v2/assetNav";
import config from "@/config";
import { RawAsset, SimpleMarketKey, SimpleMarketPeriod } from "@/types";

type Campaign = {
  symbol: SimpleMarketKey;
  period: SimpleMarketPeriod;
};
const prepareCampaign = (assets: RawAsset[]) => {
  const allCamps = Object.values(config.simpleMarkets).reduce((acc, v) => {
    if (v.listed) {
      for (const period of v.periods) {
        acc.push({
          symbol: v.slug as SimpleMarketKey,
          period: period as SimpleMarketPeriod,
        });
      }
    }
    return acc;
  }, [] as Campaign[]);
  const periodIndexMap = Object.fromEntries(periodOrder.map((p, i) => [p, i]));
  const assetSpentMap = Object.fromEntries(
    assets.map((a) => [a.name.toLowerCase(), a.totalSpent ?? 0]),
  );
  const orderedCamps = allCamps.sort((a, b) => {
    const diff = periodIndexMap[a.period] - periodIndexMap[b.period];
    if (diff !== 0) return diff;

    const aSpent = assetSpentMap[a.symbol.toLowerCase()] ?? 0;
    const bSpent = assetSpentMap[b.symbol.toLowerCase()] ?? 0;
    return bSpent - aSpent;
  });
  return orderedCamps;
};
export const getNextCampaign = ({
  period,
  symbol,
  assets,
}: Campaign & { assets: RawAsset[] }) => {
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
}: Campaign & { assets: RawAsset[] }) => {
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

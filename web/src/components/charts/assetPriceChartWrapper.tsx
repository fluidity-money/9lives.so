import { PricePoint, SimpleCampaignDetail } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import AssetPriceChartMask from "./assetPriceChartMask";
import AssetPriceChart from "./assetPriceChart";
import { useEffect } from "react";
import config from "@/config";
import { useWSForNextMarket } from "@/hooks/useWSForNextMarket";

export default function PriceChartWrapper({
  campaignData,
  pointsData,
  simple,
}: {
  campaignData: SimpleCampaignDetail;
  pointsData: PricePoint[];
  simple: boolean;
}) {
  const symbol = campaignData.priceMetadata.baseAsset;
  const starting = campaignData.starting;
  const ending = campaignData.ending;
  useWSForNextMarket(campaignData, simple);
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery<PricePoint[]>({
    queryKey: ["assetPrices", symbol, starting, ending],
    initialData: { pages: [pointsData], pageParams: [0] },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < config.hasuraMaxQueryItem) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
  });
  const assetPrices = data.pages.flatMap((c) => c);

  useEffect(() => {
    if (hasNextPage && assetPrices?.length) {
      fetchNextPage();
    }
  }, [hasNextPage, assetPrices?.length, fetchNextPage]);

  return (
    <div className="relative">
      <AssetPriceChartMask simple={simple} campaignData={campaignData} />
      <AssetPriceChart
        simple={simple}
        starting={starting}
        ending={ending}
        symbol={symbol}
        assetPrices={assetPrices}
        basePrice={+campaignData.priceMetadata.priceTargetForUp}
        id={campaignData.identifier}
      />
    </div>
  );
}

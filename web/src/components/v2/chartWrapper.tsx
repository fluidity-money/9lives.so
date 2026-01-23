import { PricePoint, SimpleCampaignDetail } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import AssetPriceChartMask from "./chartMask";
import AssetPriceChart from "./chart";
import { useEffect } from "react";
import config from "@/config";
import { useWSForNextMarket } from "@/hooks/useWSForNextMarket";
import LiveTrades from "./trades";

export default function PriceChartWrapper({
  campaignData,
  simple,
}: {
  campaignData: SimpleCampaignDetail;
  simple: boolean;
}) {
  const symbol = campaignData.priceMetadata.baseAsset;
  const starting = campaignData.starting;
  const ending = campaignData.ending;
  useWSForNextMarket(campaignData, simple);
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery<
    PricePoint[]
  >({
    queryKey: ["assetPrices", symbol, starting, ending],
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < config.hasuraMaxQueryItem) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
  });
  const assetPrices = data?.pages.flatMap((c) => c);

  useEffect(() => {
    if (hasNextPage && assetPrices?.length) {
      fetchNextPage();
    }
  }, [hasNextPage, assetPrices?.length, fetchNextPage]);

  if (!assetPrices || !data || isLoading)
    return <div className="skeleton" style={{ height: 320 }} />;

  return (
    <div className="relative">
      <AssetPriceChartMask simple={simple} campaignData={campaignData} />
      <AssetPriceChart
        starting={starting}
        ending={ending}
        symbol={symbol}
        assetPrices={assetPrices}
        basePrice={+campaignData.priceMetadata.priceTargetForUp}
        id={campaignData.identifier}
      />
      <div className="absolute bottom-4 left-px z-[9] md:left-[-51px]">
        <LiveTrades
          campaignId={campaignData.identifier}
          poolAddress={campaignData.poolAddress}
        />
      </div>
    </div>
  );
}

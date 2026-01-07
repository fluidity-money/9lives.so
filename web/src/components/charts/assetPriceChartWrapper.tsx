import { PricePoint, SimpleCampaignDetail } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import AssetPriceChartMask from "./assetPriceChartMask";
import AssetPriceChart from "./assetPriceChart";
import { useEffect, useState } from "react";
import config from "@/config";
import { useWSForNextMarket } from "@/hooks/useWSForNextMarket";
import { EVENTS, track } from "@/utils/analytics";
import Button from "../themed/button";

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

  const [simpleChart, setSimpleChart] = useState(simple);
  const handleZoomBtnClick = () => {
    setSimpleChart(!simpleChart);
    track(EVENTS.ZOOM_CHART, {
      direction: simpleChart ? "in" : "out",
      asset: campaignData.priceMetadata?.baseAsset,
      targetPrice: campaignData.priceMetadata?.priceTargetForUp,
      moment: Number(
        new Date().toLocaleString("en-US", {
          timeZone: "UTC",
          minute: "numeric",
        }),
      ),
    });
  };
  const chartHeight = simple ? 300 : 320;
  useEffect(() => {
    if (hasNextPage && assetPrices?.length) {
      fetchNextPage();
    }
  }, [hasNextPage, assetPrices?.length, fetchNextPage]);

  if (!assetPrices || !data || isLoading)
    return <div className="skeleton" style={{ height: chartHeight }} />;

  return (
    <div className="relative">
      <Button
        onClick={handleZoomBtnClick}
        title={simpleChart ? "Zoom In" : "Zoom Out"}
        className={"absolute left-0 top-0 z-[9]"}
        size={"small"}
      />
      <AssetPriceChartMask simple={simple} campaignData={campaignData} />
      <AssetPriceChart
        simple={simpleChart}
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

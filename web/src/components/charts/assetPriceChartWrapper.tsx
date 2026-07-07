import { PricePoint, SimpleCampaignDetail } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AssetPriceChartMask from "./assetPriceChartMask";
import AssetPriceChart from "./assetPriceChart";
import { useState } from "react";
import LiveTrades from "../trades";
import config from "@/config";
import mergePricePoints from "@/utils/mergePricePoints";
import { requestAssetPrices } from "@/providers/graphqlClient";
import { useWSForDetail } from "@/hooks/useWSForDetail";

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
  useWSForDetail({
    asset: symbol,
    starting,
    ending,
    previousData: campaignData,
    simple,
  });
  const queryClient = useQueryClient();
  const { data: assetPrices, isLoading } = useQuery<PricePoint[]>({
    queryKey: ["assetPrices", symbol, starting, ending],
    // Seed the chart over HTTP so it renders immediately; the
    // websocket stream keeps it live afterwards.
    queryFn: async () => {
      const fetched = await requestAssetPrices(
        symbol.toUpperCase(),
        Math.floor(starting / 1000),
        Math.ceil(Math.min(Date.now(), ending) / 1000),
      );
      const decimals = config.simpleMarkets[symbol].decimals;
      const points = (fetched ?? []).map((i) => ({
        price: Number(i.amount.toFixed(decimals)),
        id: i.id,
        timestamp: i.createdAt * 1000,
      }));
      // Live points may have landed over the websocket while this
      // request was in flight; never drop them.
      const live = queryClient.getQueryData<PricePoint[]>([
        "assetPrices",
        symbol,
        starting,
        ending,
      ]);
      return mergePricePoints(live, points);
    },
    staleTime: Infinity,
    retry: 1,
  });

  const [simpleChart, setSimpleChart] = useState(simple);
  // const handleZoomBtnClick = () => {
  //   setSimpleChart(!simpleChart);
  //   track(EVENTS.ZOOM_CHART, {
  //     direction: simpleChart ? "in" : "out",
  //     asset: campaignData.priceMetadata?.baseAsset,
  //     targetPrice: campaignData.priceMetadata?.priceTargetForUp,
  //     moment: Number(
  //       new Date().toLocaleString("en-US", {
  //         timeZone: "UTC",
  //         minute: "numeric",
  //       }),
  //     ),
  //   });
  // };
  const chartHeight = simple ? 300 : 320;

  if (!assetPrices || 2 > assetPrices.length || isLoading)
    return <div className="skeleton" style={{ height: chartHeight }} />;

  return (
    <div className="relative">
      {/* <Button
        onClick={handleZoomBtnClick}
        title={simpleChart ? "Zoom In" : "Zoom Out"}
        className={"absolute left-0 top-0 z-[9]"}
        size={"small"}
      /> */}
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
      <div className="absolute bottom-4 left-px z-[9] md:left-[-51px]">
        <LiveTrades campaignId={campaignData.identifier} />
      </div>
    </div>
  );
}

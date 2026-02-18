import { PricePoint, SimpleCampaignDetail } from "@/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import AssetPriceChartMask from "./chartMask";
import AssetPriceChart from "./chart";
import { useEffect } from "react";
import config from "@/config";
import { useWSForNextMarket } from "@/hooks/useWSForNextMarket";
import LiveTrades from "./trades";
import formatFusdc from "@/utils/format/formatUsdc";
import { useWSForPrices } from "@/hooks/useWSForPrices";

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
  useWSForPrices({ asset: symbol, ending, starting });
  const { data: assetPrices, isLoading } = useQuery<PricePoint[]>({
    queryKey: ["assetPrices", symbol, starting, ending],
    queryFn: async () => {
      throw new Error(
        "This function should be called. This query is being updated by websocket.",
      );
    },
    enabled: false,
  });
  const totalVolume = campaignData.odds
    ? Object.values(campaignData.odds).reduce((acc, v) => acc + Number(v), 0)
    : "0";
  const formattedVolume = formatFusdc(totalVolume, 2);

  if (!assetPrices || 1 > assetPrices.length || isLoading)
    return <div className="skeleton" style={{ height: 320 }} />;

  return (
    <div className="relative">
      <AssetPriceChartMask simple={simple} campaignData={campaignData} />
      <AssetPriceChart
        volume={formattedVolume}
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

import { PricePoint, SimpleCampaignDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";
import AssetPriceChartMask from "./chartMask";
import AssetPriceChart from "./chart";
import LiveTrades from "./trades";
import formatFusdc from "@/utils/format/formatUsdc";
import { useWSForDetail } from "@/hooks/useWSForDetail";
import { useWSForTrades } from "@/hooks/useWSForTrades";

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
    ending,
    starting,
    previousData: campaignData,
    simple,
  });
  useWSForTrades({
    previousData: campaignData,
    simple,
    isDpm: !!campaignData.isDpm,
  });
  const { data: assetPrices } = useQuery<PricePoint[]>({
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

  return (
    <div className="relative">
      <AssetPriceChartMask simple={simple} campaignData={campaignData} />
      <AssetPriceChart
        starting={starting}
        ending={ending}
        symbol={symbol}
        assetPrices={assetPrices ?? []}
        basePrice={+campaignData.priceMetadata.priceTargetForUp}
        id={campaignData.identifier}
      />
      <span className="absolute inset-x-0 -bottom-1 block text-center text-xs text-neutral-400">
        ${formattedVolume} Vol.
      </span>
      <div className="absolute bottom-4 left-px z-[9] md:left-[-51px]">
        <LiveTrades campaignId={campaignData.identifier} />
      </div>
    </div>
  );
}

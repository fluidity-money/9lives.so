import { PricePoint, SimpleCampaignDetail } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AssetPriceChartMask from "./chartMask";
import AssetPriceChart from "./chart";
import LiveTrades from "./trades";
import config from "@/config";
import formatFusdc from "@/utils/format/formatUsdc";
import mergePricePoints from "@/utils/mergePricePoints";
import { requestAssetPrices } from "@/providers/graphqlClient";
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
  const queryClient = useQueryClient();
  const { data: assetPrices } = useQuery<PricePoint[]>({
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

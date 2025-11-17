import ActiveCampaignProvider from "@/providers/activeCampaignProvider";
import { PricePoint, SimpleCampaignDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";
import AssetPriceChartMask from "./assetPriceChartMask";
import AssetPriceChart from "./assetPriceChart";

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
  const { data: assetPrices, isSuccess: assetsLoaded } = useQuery<PricePoint[]>(
    {
      queryKey: ["assetPrices", symbol, starting, ending],
      initialData: pointsData,
    },
  );

  return (
    <ActiveCampaignProvider previousData={campaignData}>
      <div className="relative">
        <AssetPriceChartMask campaignData={campaignData} />
        <AssetPriceChart
          simple={simple}
          starting={starting}
          ending={ending}
          symbol={symbol}
          assetPrices={assetPrices}
          assetsLoaded={assetsLoaded}
          basePrice={+campaignData.priceMetadata.priceTargetForUp}
          id={campaignData.identifier}
        />
      </div>
    </ActiveCampaignProvider>
  );
}

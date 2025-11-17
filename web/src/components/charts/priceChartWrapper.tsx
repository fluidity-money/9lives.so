import ActiveCampaignProvider from "@/providers/activeCampaignProvider";
import AssetPriceChart from "./assetPriceChart";
import {
  CampaignDetail,
  Outcome,
  PricePoint,
  SimpleCampaignDetail,
} from "@/types";
import RetroCard from "../cardRetro";
import isMarketOpen, { calcNextMarketOpen } from "@/utils/isMarketOpen";
import config from "@/config";
import CountdownTimer from "../countdownTimer";
import { useQuery } from "@tanstack/react-query";
function NotActiveMask({
  title,
  desc,
  comp,
}: {
  title: string;
  desc?: string;
  comp?: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-9layer/60 font-chicago">
      <div className="mb-36 min-w-[232px]">
        <RetroCard position="middle" showClose={false} title={title}>
          {desc ? <span className="block text-center">{desc}</span> : null}
          {comp}
        </RetroCard>
      </div>
    </div>
  );
}
function WillOpenTimer({ slug }: { slug: keyof typeof config.simpleMarkets }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span>Market Opens in:</span>
      <CountdownTimer endTime={calcNextMarketOpen(slug)} />
    </div>
  );
}
export default function PriceChartWrapper({
  campaignData,
  pointsData,
  simple,
}: {
  campaignData: SimpleCampaignDetail;
  pointsData: PricePoint[];
  simple: boolean;
}) {
  const isOpen = isMarketOpen(
    config.simpleMarkets[campaignData.priceMetadata.baseAsset],
  );
  const winnerOutcome = campaignData.outcomes.find(
    (o) => o.identifier === campaignData?.winner,
  ) as Outcome;
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
        {isOpen === false ? (
          <NotActiveMask
            title="Market Currently Closed"
            comp={<WillOpenTimer slug={campaignData.priceMetadata.baseAsset} />}
          />
        ) : winnerOutcome ? (
          <NotActiveMask
            title="Winner"
            desc={
              winnerOutcome.name === "Up" ? "Price Went Up" : "Price Went Down"
            }
          />
        ) : null}
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

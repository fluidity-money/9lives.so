import config from "@/config";
import useCountdown from "@/hooks/useCountdown";
import { Outcome, SimpleCampaignDetail } from "@/types";
import isMarketOpen, { calcNextMarketOpen } from "@/utils/isMarketOpen";
import CountdownTimer from "../countdownTimer";
import RetroCard from "../cardRetro";
import LoadingIndicator from "../loadingIndicator";
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
export default function AssetPriceChartMask({
  campaignData,
  simple,
}: {
  campaignData: SimpleCampaignDetail;
  simple: boolean;
}) {
  const isOpen = isMarketOpen(
    config.simpleMarkets[campaignData.priceMetadata.baseAsset],
  );
  const winnerOutcome = campaignData.outcomes.find(
    (o) => o.identifier === campaignData?.winner,
  ) as Outcome;
  const timeleft = useCountdown(campaignData.ending, "differenceInMs");
  const isEnded = 0 >= Number(timeleft);

  if (isOpen === false)
    return (
      <NotActiveMask
        title="Market Currently Closed"
        comp={<WillOpenTimer slug={campaignData.priceMetadata.baseAsset} />}
      />
    );

  if (winnerOutcome)
    return (
      <NotActiveMask
        title="Winner"
        desc={winnerOutcome.name === "Up" ? "Price Went Up" : "Price Went Down"}
        comp={
          simple && (
            <div className="mt-1 flex flex-col items-center text-xs">
              <span className="font-geneva text-sm">
                Setting up the next campaign
              </span>
              <LoadingIndicator />
            </div>
          )
        }
      />
    );

  if (isEnded)
    return <NotActiveMask title="Ended" desc={"Winner is resolving"} />;

  return null;
}

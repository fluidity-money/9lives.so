import config from "@/config";
import useCountdown from "@/hooks/useCountdown";
import { Outcome, SimpleCampaignDetail, SimpleMarketKey } from "@/types";
import isMarketOpen, { calcNextMarketOpen } from "@/utils/isMarketOpen";
import CountdownTimer from "../countdownTimer";
function NotActiveMask({
  desc,
  comp,
}: {
  desc?: string;
  comp?: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-9layer/60 font-chicago">
      <div className="mb-36 min-w-[232px] rounded-lg border border-neutral-400 bg-2white/70 p-3 shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)]">
        {desc ? (
          <span className="block text-center text-base font-medium leading-5">
            {desc}
          </span>
        ) : null}
        {comp}
      </div>
    </div>
  );
}
function WillOpenTimer({ slug }: { slug: SimpleMarketKey }) {
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
        comp={<WillOpenTimer slug={campaignData.priceMetadata.baseAsset} />}
      />
    );

  if (winnerOutcome)
    return (
      <NotActiveMask
        desc={
          winnerOutcome.name === "Up" ? "Market Went Up" : "Market Went Down"
        }
        comp={
          simple && (
            <div className="mt-1 flex flex-col items-center text-xs">
              <span className="text-sm">Setting up the next campaign...</span>
            </div>
          )
        }
      />
    );

  if (isEnded) return <NotActiveMask desc={"Determining winner..."} />;

  return null;
}

import formatFusdc from "@/utils/formatFusdc";
import WatchlistButton from "../watchlistButton";
import { Campaign } from "@/types";
import CountdownTimer from "../countdownTimer";

const weekDuration = 60 * 60 * 24 * 7;
export default function CampaignItemFooter({ data }: { data: Campaign }) {
  const left = data.ending - Math.floor(Date.now() / 1000);
  const inThisWeek = weekDuration >= left && left > 0;
  return (
    <div className="flex items-center justify-between gap-2 font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      {data.totalVolume === 0 ? null : (
        <span>{formatFusdc(data.totalVolume)} USDC Vol.</span>
      )}
      {inThisWeek && !data.winner ? (
        <CountdownTimer endTime={data.ending} />
      ) : null}
      <WatchlistButton type="small" data={data} className="ml-auto" />
    </div>
  );
}

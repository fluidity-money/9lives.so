import config from "@/config";
import { Campaign } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import { useEffect, useState } from "react";
import CountdownTimer from "../countdownTimer";
import WatchlistButton from "../watchlistButton";

export default function CampaignItemFooter({ data }: { data: Campaign }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const left = data.ending - now;
  const inThisWeek = config.weekDuration >= left && left > 0;

  return (
    <div className="flex items-center justify-between gap-2 font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      {data.totalVolume !== 0 && (
        <span>{formatFusdc(data.totalVolume)} USDC Vol.</span>
      )}
      {inThisWeek && !data.winner && <CountdownTimer endTime={data.ending} />}
      <WatchlistButton type="small" data={data} className="ml-auto" />
    </div>
  );
}

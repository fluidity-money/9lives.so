import formatFusdc from "@/utils/formatFusdc";
import WatchlistButton from "../watchlistButton";
import { Campaign } from "@/types";

export default function CampaignItemFooter({ data }: { data: Campaign }) {
  return (
    <div className="flex items-center justify-between gap-2 font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
      {data.totalVolume === 0 ? null : (
        <span>{formatFusdc(data.totalVolume)} USDC Vol.</span>
      )}
      <WatchlistButton type="small" data={data} className="ml-auto" />
    </div>
  );
}

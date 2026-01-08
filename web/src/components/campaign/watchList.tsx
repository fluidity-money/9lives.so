import { useUserStore } from "@/stores/userStore";
import { combineClass } from "@/utils/combineClass";
import CampaignItem from "./campaignItem";

export default function WatchList() {
  const watchlist = useUserStore((s) => s.watchlist);
  return watchlist?.length === 0 ? (
    <div className="flex items-center justify-center">
      <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
        No campaigns in your watchlist
      </span>
    </div>
  ) : (
    <div
      className={
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {watchlist?.map((c) => (
        <CampaignItem key={c.identifier} data={c} />
      ))}
    </div>
  );
}

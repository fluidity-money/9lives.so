import { useUserStore } from "@/stores/userStore";
import { combineClass } from "@/utils/combineClass";
import { useDegenStore } from "@/stores/degenStore";
import CampaignItem from "./campaignItem";

export default function WatchList() {
  const watchlist = useUserStore((s) => s.watchlist);
  const isDegenModeEnabled = useDegenStore((s) => s.degenModeEnabled);
  return watchlist?.length === 0 ? (
    <div className="flex items-center justify-center">
      <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
        No campaigns in your watchlist
      </span>
    </div>
  ) : (
    <div
      className={combineClass(
        "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4",
        !isDegenModeEnabled && "sm:grid-cols-2",
      )}
    >
      {watchlist?.map((c) => (
        <CampaignItem key={c.identifier} data={c} />
      ))}
    </div>
  );
}

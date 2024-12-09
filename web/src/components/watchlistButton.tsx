"use client";
import { useUserStore } from "@/stores/userStore";
import Button from "./themed/button";
import { combineClass } from "@/utils/combineClass";

export default function WatchlistButton({ id }: { id: string }) {
  const watchlist = useUserStore((s) => s.watchlist);
  const addToWatchlist = useUserStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useUserStore((s) => s.removeFromWatchlist);

  const isInWatchlist = watchlist.includes(id);
  function handleToggle() {
    isInWatchlist ? removeFromWatchlist(id) : addToWatchlist(id);
  }

  return (
    <Button
      onClick={handleToggle}
      className={combineClass(
        isInWatchlist && "group !bg-9yellow hover:!bg-9red",
        "flex shrink-0 items-center gap-1",
      )}
    >
      <div
        className={combineClass(
          isInWatchlist
            ? "bg-watchlistIn group-hover:bg-watchlistRemove"
            : "bg-watchlistAdd",
          "size-3 bg-contain bg-center bg-no-repeat",
        )}
      />
      {isInWatchlist ? "Watching" : "Add to Watchlist"}
    </Button>
  );
}

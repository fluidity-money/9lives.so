"use client";
import { useUserStore } from "@/stores/userStore";
import Button from "./themed/button";
import { combineClass } from "@/utils/combineClass";
import { Campaign } from "@/types";
import { MouseEvent } from "react";

export default function WatchlistButton({
  data,
  type = "default",
  className,
}: {
  data: Campaign;
  type?: "default" | "small";
  className?: string;
}) {
  const watchlist = useUserStore((s) => s.watchlist);
  const addToWatchlist = useUserStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useUserStore((s) => s.removeFromWatchlist);

  const isInWatchlist = watchlist.find((c) => c.identifier === data.identifier);
  function handleToggle(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    isInWatchlist ? removeFromWatchlist(data.identifier) : addToWatchlist(data);
  }
  return (
    <Button
      onClick={handleToggle}
      className={combineClass(
        className,
        isInWatchlist && "group !bg-9yellow hover:!bg-9red",
        "flex shrink-0 items-center gap-1",
      )}
    >
      <div
        className={combineClass(
          isInWatchlist
            ? "bg-watchlistIn group-hover:bg-watchlistRemove"
            : type == "default"
              ? "bg-watchlistAdd"
              : "bg-watchlistAddEye",
          "size-3 bg-contain bg-center bg-no-repeat",
        )}
      />
      {type == "default" ? (
        <span>{isInWatchlist ? "Watching" : "Add to Watchlist"}</span>
      ) : null}
    </Button>
  );
}

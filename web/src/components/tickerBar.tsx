"use client";
import useAssetsHourlyDelta from "@/hooks/useAssetsHourlyDelta";
import { EnrichedAssetMetadata } from "@/types";
import ArrowIcon from "./arrowIcon";
import { combineClass } from "@/utils/combineClass";
import { useEffect, useRef, useState } from "react";
import enrichAssets from "@/utils/enrichAssets";
import Link from "next/link";

function TickerItem({ data }: { data: EnrichedAssetMetadata }) {
  const isPriceUp = Number(data.price) - Number(data.hourAgoPrice) > 0;
  return (
    <li className="">
      <Link
        href={data.link}
        className="flex items-center gap-2 border-l border-l-neutral-200 p-2 hover:bg-neutral-100"
      >
        <div className="flex items-center gap-1">
          <span className="flex size-4 items-center justify-center rounded-sm bg-neutral-200 text-[9px]">
            {data.period}
          </span>
          <span className="text-sm font-bold text-neutral-400">
            ${data.name}
          </span>
        </div>
        <span
          className={combineClass(
            isPriceUp ? "text-green-600" : "text-red-600",
            "text-xs font-medium",
          )}
        >
          {Number(data.price).toFixed(2)}
        </span>
        <ArrowIcon variant={isPriceUp ? "up" : "down"} />
      </Link>
    </li>
  );
}

export default function TickerBar() {
  const { data: assets, isLoading } = useAssetsHourlyDelta();
  const enrichedAssets = enrichAssets(assets);
  const populatedList = Array.from(
    { length: enrichedAssets.length * 5 },
    (_, idx) => enrichedAssets[idx % enrichedAssets.length],
  );
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const speed = 40; // px per second
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!trackRef.current) return;

    const width = trackRef.current.scrollWidth / 2;
    setTrackWidth(width);
  }, [assets]);

  if (isLoading) return <div className="skeleton mb-4 h-9 w-full" />;

  return (
    <div
      className="relative mb-4 overflow-hidden border-y border-y-neutral-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackRef}
        className="ticker-track flex w-max"
        style={{
          animationDuration: trackWidth ? `${trackWidth / speed}s` : "20s",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {populatedList.map((a, i) => (
          <TickerItem data={a} key={`${a.name}-${i}`} />
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          animation-name: ticker-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-${trackWidth}px);
          }
        }
      `}</style>
    </div>
  );
}

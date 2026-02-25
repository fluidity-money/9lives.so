"use client";
import useAssetsHourlyDelta from "@/hooks/useAssetsHourlyDelta";
import { AssetMetadata } from "@/types";
import ArrowIcon from "./arrowIcon";
import { combineClass } from "@/utils/combineClass";

function TickerItem({ data }: { data: AssetMetadata }) {
  const isPriceUp = Number(data.price) - Number(data.hourAgoPrice) > 0;
  return (
    <li className="flex items-center gap-2 border-l border-l-neutral-200 p-2">
      <div className="flex items-center gap-1">
        <span className="flex size-4 items-center justify-center rounded-sm bg-neutral-200 text-[9px]">
          H
        </span>
        <span className="text-sm font-bold text-neutral-400">${data.name}</span>
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
    </li>
  );
}

export default function TickerBar() {
  const { data: assets, isLoading } = useAssetsHourlyDelta();

  if (isLoading) return <div className="skeleton mb-4 h-9 w-full" />;

  return (
    <ul className="mb-4 flex items-center overflow-hidden border-y border-y-neutral-200">
      {assets?.map((a) => (
        <TickerItem data={a} key={a.name} />
      ))}
    </ul>
  );
}

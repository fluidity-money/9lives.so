import { combineClass } from "@/utils/combineClass";
import AssetTimer from "./assetTimer";
import { SimpleMarketPeriod } from "@/types";

export default function AssetButton({
  title,
  isLive,
  selected,
  period,
}: {
  isLive: boolean;
  selected: boolean;
  title: string;
  period: SimpleMarketPeriod;
}) {
  return (
    <div
      className={combineClass(
        selected ? "border-b border-neutral-400" : "md:border-neutral-200",
        "flex flex-row items-center justify-between gap-1 p-2 md:rounded-lg md:border",
      )}
    >
      <span className="flex items-center justify-start text-sm text-2black">
        <span className="text-neutral-400">$</span>
        {title}
      </span>
      <span
        className={combineClass(
          isLive ? "text-green-600" : "text-neutral-400",
          "hidden text-[9px] font-bold leading-[20px] tracking-tight md:block",
        )}
      >
        {isLive ? "LIVE" : "END"}
      </span>
    </div>
  );
}

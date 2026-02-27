import { combineClass } from "@/utils/combineClass";
import { SimpleMarketPeriod } from "@/types";
import ArrowIcon from "../arrowIcon";

export default function AssetButton({
  title,
  isLive,
  selected,
  isPriceUp,
}: {
  isLive: boolean;
  selected: boolean;
  title: string;
  period: SimpleMarketPeriod;
  isPriceUp?: boolean;
}) {
  return (
    <div
      className={combineClass(
        selected
          ? "border-b-2 border-b-2black md:border-2 md:border-2black"
          : "md:border-neutral-200",
        "flex flex-row items-center justify-between gap-1 p-2 md:rounded-lg md:border",
      )}
    >
      <span className="flex items-center justify-start text-sm text-2black">
        <span className="text-neutral-400">$</span>
        {title}
      </span>
      {isPriceUp !== undefined ? (
        <ArrowIcon variant={isPriceUp ? "up" : "down"} />
      ) : null}
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

import { combineClass } from "@/utils/combineClass";

export default function AssetButton({
  title,
  isLive,
  selected,
}: {
  isLive: boolean;
  selected: boolean;
  title: string;
}) {
  return (
    <div
      className={combineClass(
        selected ? "border-neutral-400" : "md:border-neutral-200",
        "flex flex-col gap-1 border-b p-2 md:rounded-lg md:border",
      )}
    >
      <span className="flex items-center justify-start text-sm text-2black">
        <span className="text-neutral-400">$</span>
        {title}
      </span>
      <div
        className={combineClass(
          isLive ? "text-green-400" : "text-neutral-400",
          "inline-flex hidden items-start justify-start gap-0.5 self-stretch md:block",
        )}
      >
        <div className="justify-center text-[9px] font-bold tracking-tight">
          {isLive ? "LIVE" : "END"}
        </div>
        <div
          className={combineClass(
            isLive ? "border-green-400" : "border-neutral-400",
            "flex h-3 w-20 items-center rounded-full rounded-xl border p-0.5",
          )}
        >
          <div
            className={combineClass(
              isLive ? "bg-green-400" : "bg-neutral-400",
              "h-2 flex-1 rounded-full",
            )}
          ></div>
        </div>
      </div>
    </div>
  );
}

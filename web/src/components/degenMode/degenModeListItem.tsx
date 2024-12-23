import { Action } from "@/types";
import { combineClass } from "@/utils/combineClass";
import Image from "next/image";
export default function DegenModeListItem({ data }: { data: Action }) {
  const typeColorBgClass =
    data.type === "buy"
      ? "bg-9green"
      : data.type === "sell"
        ? "bg-9red"
        : "bg-9yellow";
  return (
    <div
      className={combineClass(
        "relative rounded-[2px] border border-9black bg-white shadow-9degen",
      )}
    >
      <div
        className={combineClass(
          "absolute inset-0 z-[1] animate-fade opacity-0",
          typeColorBgClass,
        )}
      />
      <div className="relative z-10 flex items-center gap-4 px-[10px] py-[15px]">
        <Image
          src={data.campaignPic}
          alt={data.campaignName}
          width={44}
          height={44}
          className="size-[44px] object-contain"
        />
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-chicago text-xs">{data.campaignName}</span>
            <span className="font-geneva text-[10px] uppercase text-gray-500">
              {data.timestamp}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span
                className={combineClass(
                  "px-1 py-0.5 font-geneva text-[10px] uppercase leading-[12px]",
                  typeColorBgClass,
                )}
              >
                {data.type === "buy"
                  ? "BOUGHT"
                  : data.type === "sell"
                    ? "SOLD"
                    : "NEW CAMPAIGN"}
              </span>
              {data.type !== "create" ? (
                <span className="font-geneva text-[10px] uppercase">
                  {data.actionValue ?? "?"} FOR {data.outcomeName ?? "?"}
                </span>
              ) : null}
            </div>
            <span className="font-geneva text-[10px] uppercase">
              ${data.campaignVol ?? "?"} VOL.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Action } from "@/types";
import { combineClass } from "@/utils/combineClass";
import Image from "next/image";
export default function DegenModeListItem({ data }: { data: Action }) {
  return (
    <div
      className={combineClass(
        "flex items-center gap-4 rounded-[2px] border border-9black bg-white px-[10px] py-[15px] shadow-9degen",
      )}
    >
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
                data.type === "buy"
                  ? "bg-9green"
                  : data.type === "sell"
                    ? "bg-9red"
                    : "bg-9yellow",
              )}
            >
              {data.type === "buy"
                ? "BOUGHT"
                : data.type === "sell"
                  ? "SOLD"
                  : "NEW CAMPAIGN"}
            </span>
            <span className="font-geneva text-[10px] uppercase">
              {data.outcomeName ?? "?"}
            </span>
          </div>
          <span className="font-geneva text-[10px] uppercase">
            ${data.campaignVol ?? "?"} VOL.
          </span>
        </div>
      </div>
    </div>
  );
}

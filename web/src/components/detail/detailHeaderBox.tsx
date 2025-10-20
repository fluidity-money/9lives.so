import { combineClass } from "@/utils/combineClass";

export const HeaderBox = ({
  title,
  value,
  shrink = false,
  rightComp,
}: {
  title: string;
  value: string;
  shrink?: boolean;
  rightComp?: React.ReactNode;
}) => (
  <div
    className={combineClass(
      shrink ? "shrink-1" : "flex-1",
      "flex justify-between gap-4 rounded-[3px] border-[1.5px] border-9black bg-[#fafafa] px-2 py-1 text-xs shadow-9liqCard md:px-4 md:py-2",
    )}
  >
    <div className="flex flex-col gap-1">
      <span className="font-geneva text-[10px] uppercase text-[#808080] md:text-xs">
        {title}
      </span>
      <span className="font-chicago text-xs md:text-lg">{value}</span>
    </div>
    {rightComp ? rightComp : null}
  </div>
);

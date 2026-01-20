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
      "flex justify-between gap-4 px-2 py-1 text-xs",
    )}
  >
    <div className="flex flex-col gap-1">
      <span className="text-right text-[10px] text-[#808080] md:text-xs">
        {title}
      </span>
      <span className="text-xs md:text-sm">{value}</span>
    </div>
    {rightComp ? rightComp : null}
  </div>
);

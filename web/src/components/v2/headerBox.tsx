import { combineClass } from "@/utils/combineClass";

export const HeaderBox = ({
  title,
  value,
  shrink = false,
  rightComp,
  valueColor,
}: {
  title: string;
  value: string;
  shrink?: boolean;
  rightComp?: React.ReactNode;
  valueColor?: string;
}) => (
  <div
    className={combineClass(
      shrink ? "shrink-1" : "flex-1",
      "flex justify-between gap-4 px-2 text-xs md:py-1",
    )}
  >
    <div className="flex gap-1 md:flex-col">
      <span className="text-right text-[10px] font-bold text-neutral-400 md:text-xs">
        {title}
      </span>
      <span
        className={combineClass(
          valueColor ?? "text-2black",
          "text-xs font-bold md:text-xl",
        )}
      >
        {value}
      </span>
    </div>
    {rightComp ? rightComp : null}
  </div>
);

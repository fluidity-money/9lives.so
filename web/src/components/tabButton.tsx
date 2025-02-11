import Image from "next/image";
import Leftborder from "#/images/left-border.svg";
import LeftborderIdle from "#/images/left-border-idle.svg";
import LeftborderSparkle from "#/images/left-border-sparkle.svg";
import Rightborder from "#/images/right-border.svg";
import RightborderIdle from "#/images/right-border-idle.svg";
import RightborderSparkle from "#/images/right-border-sparkle.svg";
import { combineClass } from "@/utils/combineClass";
import { forwardRef, HTMLAttributes } from "react";
interface TabButtonProps extends HTMLAttributes<HTMLButtonElement> {
  title: string;
  watchlist?: boolean;
  active: boolean;
  hover: boolean;
  focus: boolean;
  autofocus: boolean;
  selected: boolean;
}
export default forwardRef<HTMLButtonElement, TabButtonProps>(function TabButton(
  {
    active,
    selected,
    hover,
    focus,
    autofocus,
    title,
    watchlist = false,
    ...props
  },
  ref,
) {
  return (
    <button className="relative flex shrink-0" ref={ref} {...props}>
      <Image
        src={
          selected ? Leftborder : watchlist ? LeftborderSparkle : LeftborderIdle
        }
        height={25}
        alt={title + "left-border"}
        className="h-[25px] w-auto"
      />
      <span
        className={combineClass(
          "h-full border-t border-t-black bg-9layer px-2 py-1 font-chicago text-xs",
          selected ? "bg-9layer" : watchlist ? "bg-9yellow" : "bg-[#CCC]",
        )}
      >
        {title}
      </span>
      <Image
        src={
          selected
            ? Rightborder
            : watchlist
              ? RightborderSparkle
              : RightborderIdle
        }
        height={25}
        alt={title + "right-border"}
        className="h-[25px] w-auto"
      />
      {selected && (
        <div className="absolute -bottom-px h-[2px] w-full bg-9layer" />
      )}
    </button>
  );
});

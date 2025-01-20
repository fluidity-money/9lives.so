import Image from "next/image";
import Leftborder from "#/images/left-border.svg";
import LeftborderIdle from "#/images/left-border-idle.svg";
import Rightborder from "#/images/right-border.svg";
import RightborderIdle from "#/images/right-border-idle.svg";
import { combineClass } from "@/utils/combineClass";
import { forwardRef, HTMLAttributes } from "react";
interface TabButtonProps extends HTMLAttributes<HTMLButtonElement> {
  title: string;
  active: boolean;
  hover: boolean;
  focus: boolean;
  autofocus: boolean;
  selected: boolean;
}
export default forwardRef<HTMLButtonElement, TabButtonProps>(function TabButton(
  { active, selected, hover, focus, autofocus, title, ...props },
  ref,
) {
  return (
    <button className="relative flex shrink-0" ref={ref} {...props}>
      <Image
        src={selected ? Leftborder : LeftborderIdle}
        height={25}
        alt={title + "left-border"}
        className="h-[25px] w-auto"
      />
      <span
        className={combineClass(
          "h-full border-t border-t-black bg-9layer px-2 py-1 font-chicago text-xs",
          selected ? "bg-9layer" : "bg-[#CCC]",
        )}
      >
        {title}
      </span>
      <Image
        src={selected ? Rightborder : RightborderIdle}
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

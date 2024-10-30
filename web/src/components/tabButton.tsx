import Image from "next/image";
import Leftborder from "#/images/left-border.svg";
import LeftborderIdle from "#/images/left-border-idle.svg";
import Rightborder from "#/images/right-border.svg";
import RightborderIdle from "#/images/right-border-idle.svg";
import { combineClass } from "@/utils/combineClass";
import { forwardRef } from "react";
interface TabButtonProps {
  title: string;
  hover?: boolean;
  selected?: boolean;
}
export default forwardRef<HTMLButtonElement, TabButtonProps>(
  function TabButton(props, ref) {
    return (
      <button className="relative flex" ref={ref} {...props}>
        <Image
          src={props.selected ? Leftborder : LeftborderIdle}
          width={14}
          height={14}
          alt={props.title + "left-border"}
        />
        <span
          className={combineClass(
            "border-t border-t-black bg-9layer px-2 py-1 font-chicago text-xs",
            props.selected ? "bg-9layer" : "bg-[#CCC]",
          )}
        >
          {props.title}
        </span>
        <Image
          src={props.selected ? Rightborder : RightborderIdle}
          width={14}
          height={14}
          alt={props.title + "right-border"}
        />
        {props.selected && (
          <div className="absolute -bottom-px h-[2px] w-full bg-9layer" />
        )}
      </button>
    );
  },
);

import Image, { StaticImageData } from "next/image";
import { combineClass } from "@/utils/combineClass";
import { forwardRef } from "react";
import RadioSelectedImg from "#/images/radio-selected.svg";
import RadioUnselectedimg from "#/images/radio-unselected.svg";
interface TabButtonProps {
  title: string;
  active: boolean;
  hover: boolean;
  focus: boolean;
  autofocus: boolean;
  selected: boolean;
  activeIcon: StaticImageData;
  inactiveIcon: StaticImageData;
}
export default forwardRef<HTMLButtonElement, TabButtonProps>(
  function TabIconButton(
    { active, selected, hover, focus, autofocus, title, ...props },
    ref,
  ) {
    return (
      <button
        className={combineClass(
          "relative flex flex-1 items-center gap-2.5 rounded-sm border border-9black p-2.5",
          selected
            ? "bg-[#DDD] shadow-9btnPrimaryActive"
            : "shadow-9btnPrimaryIdle",
        )}
        ref={ref}
        {...props}
      >
        <Image
          src={selected ? props.activeIcon : props.inactiveIcon}
          width={30}
          alt=""
          className="h-auto"
        />
        <span className="font-chicago text-xs text-9black">{title}</span>
      </button>
    );
  },
);

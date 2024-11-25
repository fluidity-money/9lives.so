import Image, { StaticImageData } from "next/image";
import { combineClass } from "@/utils/combineClass";
import { forwardRef, HTMLAttributes } from "react";
interface TabButtonProps extends HTMLAttributes<HTMLButtonElement> {
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
    {
      active,
      selected,
      hover,
      focus,
      autofocus,
      title,
      activeIcon,
      inactiveIcon,
      ...props
    },
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
          src={selected ? activeIcon : inactiveIcon}
          width={30}
          alt=""
          className="h-auto"
        />
        <span className="font-chicago text-xs text-9black">{title}</span>
      </button>
    );
  },
);

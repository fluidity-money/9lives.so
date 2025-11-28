import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import { forwardRef, HTMLAttributes } from "react";
import RadioSelectedImg from "#/images/radio-selected.svg";
import RadioUnselectedimg from "#/images/radio-unselected.svg";
interface TabButtonProps extends HTMLAttributes<HTMLButtonElement> {
  title: string;
  active?: boolean;
  hover?: boolean;
  focus?: boolean;
  autofocus?: boolean;
  selected: boolean;
}
export default forwardRef<HTMLButtonElement, TabButtonProps>(
  function TabRadioButton(
    { active, selected, hover, focus, autofocus, title, ...props },
    ref,
  ) {
    return (
      <button
        className={combineClass(
          "relative flex flex-1 gap-2.5 rounded-sm border border-9black p-2.5",
          selected
            ? "bg-[#DDD] shadow-9btnPrimaryActive"
            : "shadow-9btnPrimaryIdle",
        )}
        ref={ref}
        {...props}
      >
        <Image
          src={selected ? RadioSelectedImg : RadioUnselectedimg}
          width={12}
          height={13}
          alt=""
        />
        <span className="font-chicago text-xs text-9black">{title}</span>
      </button>
    );
  },
);

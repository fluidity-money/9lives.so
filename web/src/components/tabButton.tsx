import Image from "next/image";
import Leftborder from "#/images/left-border.svg";
import LeftborderIdle from "#/images/left-border-idle.svg";
import LeftborderSparkle from "#/images/left-border-sparkle.svg";
import Rightborder from "#/images/right-border.svg";
import RightborderIdle from "#/images/right-border-idle.svg";
import RightborderSparkle from "#/images/right-border-sparkle.svg";
import RightborderGreen from "#/images/right-border-green.svg";
import RightborderRed from "#/images/right-border-red.svg";
import LeftborderGreen from "#/images/left-border-green.svg";
import LeftborderRed from "#/images/left-border-red.svg";
import { forwardRef, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
const buttonTitle = cva(
  "h-full border-t border-t-black px-2 py-1 font-chicago",
  {
    variants: {
      intent: {
        default: null,
        watchlist: null,
        buy: null,
        sell: null,
      },
      selected: {
        true: null,
        false: null,
      },
      size: {
        small: "text-xs",
        medium: "text-sm",
      },
    },
    compoundVariants: [
      {
        intent: ["default", "watchlist", "buy", "sell"],
        selected: true,
        className: "bg-9layer",
      },
      {
        intent: "default",
        selected: false,
        className: "bg-[#CCC]",
      },
      {
        intent: "watchlist",
        selected: false,
        className: "bg-9yellow",
      },
      {
        intent: "buy",
        selected: false,
        className: "bg-9green",
      },
      {
        intent: "sell",
        selected: false,
        className: "bg-9red",
      },
    ],
    defaultVariants: {
      intent: "default",
      selected: false,
      size: "small",
    },
  },
);
const buttonImg = cva("w-auto", {
  variants: {
    size: {
      small: "h-[25px]",
      medium: "h-[29px]",
    },
  },
  defaultVariants: {
    size: "small",
  },
});
interface TabButtonProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonTitle> {
  title: string;
  active?: boolean;
  hover?: boolean;
  focus?: boolean;
  autofocus?: boolean;
  selected: boolean;
}
const leftBorderUnselectedMap: Record<
  NonNullable<VariantProps<typeof buttonTitle>["intent"]>,
  any
> = {
  default: LeftborderIdle,
  watchlist: LeftborderSparkle,
  buy: LeftborderGreen,
  sell: LeftborderRed,
};
const rightBorderUnselectedMap: Record<
  NonNullable<VariantProps<typeof buttonTitle>["intent"]>,
  any
> = {
  default: RightborderIdle,
  watchlist: RightborderSparkle,
  buy: RightborderGreen,
  sell: RightborderRed,
};
export default forwardRef<HTMLButtonElement, TabButtonProps>(function TabButton(
  { active, selected, hover, focus, autofocus, title, ...props },
  ref,
) {
  return (
    <button
      className="relative flex shrink-0 overflow-y-hidden"
      ref={ref}
      {...props}
    >
      <Image
        src={
          selected
            ? Leftborder
            : leftBorderUnselectedMap[props.intent ?? "default"]
        }
        alt=""
        className={buttonImg({ size: props.size })}
      />
      <span
        className={buttonTitle({
          selected,
          intent: props.intent,
          size: props.size,
        })}
      >
        {title}
      </span>
      <Image
        src={
          selected
            ? Rightborder
            : rightBorderUnselectedMap[props.intent ?? "default"]
        }
        alt=""
        className={buttonImg({ size: props.size })}
      />
      {selected && (
        <div className="absolute -bottom-px h-[2px] w-full bg-9layer" />
      )}
    </button>
  );
});

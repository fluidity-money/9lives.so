import {
  Button as BasicButton,
  ButtonProps as BasicButtonProps,
} from "@headlessui/react";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const button = cva("text-2black disabled:opacity-40", {
  variants: {
    intent: {
      yes: "bg-green-400 font-bold text-green-700",
      no: "bg-red-400 font-bold text-red-700",
      cta: "bg-2black text-2white",
      reward: "border border-yellow-400 bg-yellow-200",
      inverted: "border border-2black/70 bg-2white",
    },
    size: {
      xsmall: "rounded-full px-2 py-1 text-[9px]",
      small: "rounded-xl px-2 py-1 text-sm",
      medium: "rounded-xl p-3 text-sm",
      large: "rounded-2xl px-4 py-3",
    },
  },
  defaultVariants: {
    size: "medium",
    intent: "cta",
  },
  compoundVariants: [
    { intent: "cta", size: "large", className: "text-base" },
    {
      intent: ["yes", "no", "reward", "inverted"],
      size: "large",
      className: "text-xl",
    },
  ],
});

export interface ButtonProps
  extends BasicButtonProps, VariantProps<typeof button> {
  icon?: React.ReactElement;
  badge?: React.ReactElement;
}

export default function Button({
  className,
  intent,
  size,
  children,
  ...props
}: ButtonProps) {
  return (
    <BasicButton {...props} className={button({ intent, size, className })}>
      {children ?? (
        <div className="flex items-center justify-center gap-1">
          {props.icon}
          <span className="text-nowrap">{props.title}</span>
          {props.badge}
        </div>
      )}
    </BasicButton>
  );
}

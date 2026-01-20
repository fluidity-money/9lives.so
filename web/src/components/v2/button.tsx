import {
  Button as BasicButton,
  ButtonProps as BasicButtonProps,
} from "@headlessui/react";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const button = cva("text-2black font-metro disabled:opacity-40", {
  variants: {
    intent: {
      yes: "bg-green-400",
      no: "bg-red-400",
      cta: "bg-2black text-2white",
      reward: "bg-yellow-200 border-yellow-400 border",
      inverted: "bg-2white border-2black/70 border",
    },
    size: {
      small: "px-2 py-1 rounded-xl text-sm",
      medium: "p-3 rounded-xl text-sm",
      large: "px-4 py-3 rounded-2xl text-base",
    },
  },
  defaultVariants: {
    size: "medium",
    intent: "cta",
  },
  compoundVariants: [],
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
        <div className="flex items-center gap-1">
          {props.icon}
          <span>{props.title}</span>
          {props.badge}
        </div>
      )}
    </BasicButton>
  );
}

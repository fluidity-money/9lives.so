import {
  Button as BasicButton,
  ButtonProps as BasicButtonProps,
} from "@headlessui/react";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const button = cva("rounded-md", {
  variants: {
    intent: {
      yes: "bg-green-100 text-green-500 hover:bg-green-300",
      no: "bg-red-100 text-red-500 hover:bg-red-300",
      cta: "bg-blue-100 text-blue-500 hover:bg-blue-300",
    },
    size: {
      small: "px-2 py-1 text-xs",
      medium: "px-4 py-2 text-base",
      large: "p-4 text-lg",
    },
  },
  defaultVariants: {
    intent: "cta",
    size: "medium",
  },
});

export interface ButtonProps
  extends BasicButtonProps,
    VariantProps<typeof button> {}

export default function Button({
  className,
  intent,
  size,
  children,
  ...props
}: ButtonProps) {
  return (
    <BasicButton {...props} className={button({ intent, size, className })}>
      {children ?? props.title}
    </BasicButton>
  );
}

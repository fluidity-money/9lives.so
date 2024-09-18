import {
  Button as BasicButton,
  ButtonProps as BasicButtonProps,
} from "@headlessui/react";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const button = cva(
  "border-9black disabled:bg-9gray font-chicago text-9black rounded-sm border text-xs focus-visible:border-2  disabled:opacity-40",
  {
    variants: {
      intent: {
        yes: "bg-9green",
        no: "bg-9red",
        cta: "bg-9blueLight",
        default: "",
      },
      cat: {
        primary:
          "shadow-9btnPrimaryIdle focus-visible:shadow-9btnPrimaryFocus hover:shadow-9btnPrimaryHover active:shadow-9btnPrimaryActive disabled:shadow-9btnPrimaryDisabled focus:outline-none ",
        secondary:
          "shadow-9btnSecondaryIdle focus-visible:shadow-9btnSecondaryFocus hover:shadow-9btnSecondaryHover active:shadow-9btnSecondaryActive disabled:shadow-9btnSecondaryDisabled focus:outline-none",
        close:
          "bg-closeIdle active:bg-closePressed rounded-none border-0 bg-[length:100%_100%] bg-center bg-no-repeat shadow-none",
      },
      size: {
        nospace: "p-0",
        small: "px-2 py-1 text-xs",
        medium: "px-4 py-2 text-base",
        large: "p-4 text-lg",
        xlarge: "px-4 py-5 text-xl",
      },
    },
    defaultVariants: {
      size: "medium",
      cat: "primary",
      intent: "default",
    },
    compoundVariants: [
      { intent: "default", cat: "primary", className: "bg-[#FAFAFA]" },
      { intent: "default", cat: "secondary", className: "bg-[#DDDDDD]" },
    ],
  },
);

export interface ButtonProps
  extends BasicButtonProps,
    VariantProps<typeof button> {}

export default function Button({
  className,
  intent,
  size,
  cat,
  children,
  ...props
}: ButtonProps) {
  return (
    <BasicButton
      {...props}
      className={button({ intent, cat, size, className })}
    >
      {children ?? props.title}
    </BasicButton>
  );
}

import {
  Button as BasicButton,
  ButtonProps as BasicButtonProps,
} from "@headlessui/react";
import { cva, type VariantProps } from "class-variance-authority";

const button = cva(
  "rounded-sm border border-9black font-chicago text-xs text-9black focus-visible:border-2 disabled:bg-9gray disabled:opacity-40",
  {
    variants: {
      intent: {
        yes: "bg-9green",
        no: "bg-9red",
        cta: "bg-9blueLight",
        reward: "bg-9yellowLight",
        default: null,
      },
      cat: {
        primary:
          "shadow-9btnPrimaryIdle hover:shadow-9btnPrimaryHover focus:outline-none focus-visible:shadow-9btnPrimaryFocus active:shadow-9btnPrimaryActive disabled:shadow-9btnPrimaryDisabled",
        secondary:
          "shadow-9btnSecondaryIdle hover:shadow-9btnSecondaryHover focus:outline-none focus-visible:shadow-9btnSecondaryFocus active:shadow-9btnSecondaryActive disabled:shadow-9btnSecondaryDisabled",
        close:
          "rounded-none border-0 bg-closeIdle bg-[length:100%_100%] bg-center bg-no-repeat shadow-none active:bg-closePressed",
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
  extends BasicButtonProps, VariantProps<typeof button> {}

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

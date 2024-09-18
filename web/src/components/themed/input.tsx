import {
  Input as BasicInput,
  InputProps as BasicInputProps,
} from "@headlessui/react";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const input = cva(
  "border-9black font-geneva bg-9gray focus-visible:ring-9black border text-sm focus:outline-none focus-visible:ring-1",
  {
    variants: {
      intent: {
        default: "shadow-9input px-4 py-2",
        range: "h-[17px] p-[3px]",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  },
);

export interface InputProps
  extends Omit<BasicInputProps, "size">,
    VariantProps<typeof input> {}

export default function Input({ className, intent, ...props }: InputProps) {
  return (
    <BasicInput
      {...props}
      className={input({ intent, className })}
    ></BasicInput>
  );
}

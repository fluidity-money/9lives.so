import {
  Input as BasicInput,
  InputProps as BasicInputProps,
} from "@headlessui/react";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const input = cva("border-9black font-geneva bg-9gray border text-xl", {
  variants: {
    intent: {
      primary: "shadow-9input",
      range: "",
    },
    size: {
      medium: "px-4 py-2",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
});

export interface InputProps
  extends Omit<BasicInputProps, "size">,
    VariantProps<typeof input> {}

export default function Input({
  className,
  intent,
  size,
  ...props
}: InputProps) {
  return (
    <BasicInput
      {...props}
      className={input({ intent, size, className })}
    ></BasicInput>
  );
}

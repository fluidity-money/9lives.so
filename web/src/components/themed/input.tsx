import {
  Input as BasicInput,
  InputProps as BasicInputProps,
} from "@headlessui/react";
import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const input = cva(
  "border border-9black bg-9gray font-geneva text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-9black",
  {
    variants: {
      intent: {
        default: "px-4 py-2 shadow-9input",
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
  VariantProps<typeof input> { }

export default forwardRef<HTMLInputElement, InputProps>(function Input({ className, intent, ...props }, ref) {
  return (
    <BasicInput
      ref={ref}
      {...props}
      className={input({ intent, className })}
    ></BasicInput>
  );
})

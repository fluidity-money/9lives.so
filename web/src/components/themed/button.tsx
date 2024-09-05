import { Button as BasicButton, ButtonProps } from "@headlessui/react";

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <BasicButton
      {...props}
      className="rounded bg-sky-600 px-4 py-2 text-sm text-white data-[active]:bg-sky-700 data-[hover]:bg-sky-500"
    >
      {children ?? props.title}
    </BasicButton>
  );
}

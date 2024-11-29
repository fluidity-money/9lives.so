import { PopoverButton } from "@headlessui/react";
import Image from "next/image";
import RightCaretIcon from "#/icons/right-caret.svg";

export default function DegenModeButton() {
  return (
    <PopoverButton
      className={
        "relative flex h-10 items-center gap-0 border-l-2 border-l-9black bg-9blueLight px-4 focus:outline-none data-[active]:bg-9layer"
      }
    >
      <span className="font-chicago text-xs underline">🐵 Degen Mode 🐵</span>
      <Image alt="" src={RightCaretIcon} width={20} height={20} />
      <div className="absolute inset-x-0 -bottom-0.5 z-10 hidden h-0.5 w-full bg-9layer group-data-[open]:flex" />
    </PopoverButton>
  );
}

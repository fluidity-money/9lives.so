"use client";
import { Popover, PopoverPanel } from "@headlessui/react";
import DegenModeButton from "./degenModeButton";
import DegenModeList from "./degenModeList";
export default function DegenMode() {
  return (
    <Popover className="group">
      <DegenModeButton />
      <PopoverPanel
        transition
        className="absolute inset-x-0 top-[42px] z-10 min-h-[calc(100vh-42px)] divide-y divide-white/5 border-l-2 border-l-9black bg-9layer text-sm/6 transition duration-200 ease-in-out data-[closed]:translate-y-2 data-[closed]:opacity-0"
      >
        <div className="">
          <DegenModeList />
        </div>
      </PopoverPanel>
    </Popover>
  );
}

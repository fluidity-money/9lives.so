"use client";
import { useDegenStore } from "@/stores/degenStore";
import DegenModeList from "./degenModeList";

export default function DegenModeWrapper() {
  const degenModeEnabled = useDegenStore((state) => state.degenModeEnabled);
  if (!degenModeEnabled) return null;
  return (
    <div className="z-0 hidden h-auto flex-1 overflow-hidden border-l-2 border-l-9black bg-9layer sm:relative sm:flex md:w-[400px] md:flex-none">
      <div className="absolute inset-0 flex flex-col gap-5 p-5">
        {/* <div className="flex flex-col gap-2.5">
          <h5 className="block text-right font-chicago text-xs">
            🐵 Degen Timeline 🐵
          </h5>
          <div className="h-px w-full bg-9black" />
        </div> */}
        <DegenModeList />
      </div>
    </div>
  );
}

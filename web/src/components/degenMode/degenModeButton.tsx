"use client";
import Image from "next/image";
import RightCaretIcon from "#/icons/right-caret.svg";
import { useDegenStore } from "@/stores/degenStore";
import { combineClass } from "@/utils/combineClass";
export default function DegenModeButton() {
  const toggleDegenMode = useDegenStore((s) => s.toggleDegenMode);
  const degenModeEnabled = useDegenStore((s) => s.degenModeEnabled);
  return (
    <button
      className={combineClass(
        degenModeEnabled ? "bg-9layer" : "bg-9blueLight",
        "relative hidden h-10 items-center gap-0 border-l-2 border-l-9black px-4 focus:outline-none sm:flex",
      )}
      onClick={toggleDegenMode}
    >
      <span className="font-chicago text-xs underline">🐵 Degen Mode 🐵</span>
      <Image
        alt=""
        src={RightCaretIcon}
        width={20}
        className={combineClass(degenModeEnabled && "rotate-90")}
      />
      <div
        className={combineClass(
          !degenModeEnabled && "hidden",
          "absolute inset-x-0 -bottom-0.5 z-10 h-0.5 w-full bg-9layer",
        )}
      />
    </button>
  );
}

"use client";
import { useActiveWallet } from "thirdweb/react";

export default function GetFusdcButton() {
  return (
    <a
      href="https://app.fluidity.money/arbitrum/fluidify"
      rel="noopener,noreferrer"
      target="_blank"
    >
      <button className="h-10 border-l-2 border-l-black px-4 font-chicago leading-10 underline">
        Get fUSDC
      </button>
    </a>
  );
}

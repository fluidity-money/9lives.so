"use client";
import { useActiveWallet } from "thirdweb/react";

export default function GetFusdcButton() {
  return (
    <button
      className="h-10 border-r-2 border-r-black px-4 font-chicago leading-10 underline"
      onClick={() => window.open("https://app.fluidity.money/arbitrum/fluidify", "_blank", "noopener,noreferrer") }
    >
      Get fUSDC
    </button>
  );
}

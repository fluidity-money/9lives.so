"use client";
import { useActiveWallet } from "thirdweb/react";

export default function CreateCampaingButton() {
  const account = useActiveWallet();

  if (!account) return;

  return (
    <button className="h-10 border-r-2 border-r-black px-4 font-chicago leading-10 underline">
      Create Campaign
    </button>
  );
}

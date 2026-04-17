"use client";

import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import PortfolioHeader from "./portfolioHeader";
import PortfolioTabs from "./portfolioTabs";
import { TIERS } from "../leaderboard/demoData";
import { MOCK_STATES, type MockPortfolioState } from "./mockData";

function PortfolioDevController({
  stateIdx,
  setStateIdx,
}: {
  stateIdx: number;
  setStateIdx: (idx: number) => void;
}) {
  if (process.env.NODE_ENV !== "development") return null;

  const labels = ["Empty", "Beginner", "Active", "Whale", "Legend"];

  return (
    <div className="fixed bottom-[60px] right-[16px] z-50 bg-[#0e0e0e] text-[#fdfdfd] rounded-[12px] p-[12px] flex flex-col gap-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-[8px]">
        <span className="font-dmMono font-medium text-[9px] uppercase tracking-[0.18px] text-[#a3a3a3]">
          Portfolio
        </span>
        <span className="font-overusedGrotesk font-semibold text-[12px]">
          {labels[stateIdx]} — {TIERS[MOCK_STATES[stateIdx].tierIdx].name}
        </span>
      </div>
      <div className="flex gap-[4px]">
        {labels.map((label, i) => (
          <button
            key={i}
            className={`px-[8px] py-[4px] rounded-[6px] font-dmMono font-medium text-[9px] cursor-pointer transition-colors whitespace-nowrap ${
              stateIdx === i
                ? "bg-[#fdfdfd] text-[#0e0e0e]"
                : "bg-[#333] text-[#a3a3a3] hover:bg-[#444]"
            }`}
            onClick={() => setStateIdx(i)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const account = useAppKitAccount();
  const resetPortfolio = usePortfolioStore((s) => s.reset);
  const [devStateIdx, setDevStateIdx] = useState(0);

  const mockState = MOCK_STATES[devStateIdx];

  useEffect(() => {
    if (!account.isConnected) resetPortfolio();
  }, [account.isConnected, resetPortfolio]);

  return (
    <div className="flex flex-1 justify-center w-full">
      <div className="flex-1 flex flex-col gap-[16px] p-4 max-w-screen-xl">
        <PortfolioHeader overrideTierIdx={mockState.tierIdx} mockState={mockState} />
        <PortfolioTabs mockState={mockState} />
      </div>
      <PortfolioDevController stateIdx={devStateIdx} setStateIdx={setDevStateIdx} />
    </div>
  );
}

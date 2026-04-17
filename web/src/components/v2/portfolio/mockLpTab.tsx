"use client";

import type { MockLP } from "./mockData";
import { combineClass } from "@/utils/combineClass";
import Button from "../button";

function LpCard({ lp }: { lp: MockLP }) {
  return (
    <div className="flex items-center gap-[12px] py-[10px] px-[12px] hover:bg-[#fafafa] rounded-[8px] transition-colors">
      <div className="flex flex-col gap-[2px] flex-1 min-w-0">
        <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e] truncate">
          {lp.campaignName}
        </span>
        <div className="flex items-center gap-[6px]">
          {lp.isEnded && (
            <span className="font-dmMono text-[9px] uppercase px-[6px] py-[2px] rounded-[4px] bg-[#fafafa] text-[#a3a3a3]">
              Concluded
            </span>
          )}
          {!lp.isEnded && (
            <span className="font-dmMono text-[9px] uppercase px-[6px] py-[2px] rounded-[4px] bg-green-50 text-green-600">
              Active
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-[2px] shrink-0">
        <span className="font-overusedGrotesk font-bold text-[16px] text-[#0e0e0e]">
          ${lp.liquidity.toFixed(2)}
        </span>
        <span className="font-dmMono text-[9px] text-[#a3a3a3] uppercase">liquidity</span>
      </div>
      <div className="flex flex-col items-end gap-[2px] shrink-0">
        <span className={combineClass(
          "font-overusedGrotesk font-semibold text-[14px]",
          lp.unclaimedRewards > 0 ? "text-[#16a34a]" : "text-[#a3a3a3]",
        )}>
          ${lp.unclaimedRewards.toFixed(2)}
        </span>
        <span className="font-dmMono text-[9px] text-[#a3a3a3] uppercase">unclaimed</span>
      </div>
      {lp.unclaimedRewards > 0 && (
        <Button intent="reward" title="Claim" size="small" />
      )}
    </div>
  );
}

export default function MockLpTab({ lps }: { lps: MockLP[] }) {
  if (lps.length === 0) {
    return (
      <div className="relative bg-[#fdfdfd] rounded-[12px] w-full">
        <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
        <div className="flex flex-col items-center justify-center py-[48px] gap-[8px] relative">
          <span className="font-overusedGrotesk font-semibold text-[16px] text-[#0e0e0e]">No LP positions yet.</span>
          <span className="font-dmMono text-[11px] text-[#a3a3a3] uppercase tracking-[0.22px]">Provide liquidity to earn fees.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#fdfdfd] rounded-[12px] w-full">
      <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col divide-y divide-[#f0f0f0] p-[8px] relative">
        {lps.map((lp, i) => <LpCard key={i} lp={lp} />)}
      </div>
    </div>
  );
}

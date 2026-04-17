"use client";

import type { MockClaim } from "./mockData";
import { combineClass } from "@/utils/combineClass";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ClaimCard({ c }: { c: MockClaim }) {
  return (
    <div className="flex items-center gap-[12px] py-[10px] px-[12px] hover:bg-[#fafafa] rounded-[8px] transition-colors">
      <div className="flex flex-col gap-[2px] flex-1 min-w-0">
        <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e] truncate">
          {c.campaignName}
        </span>
        <div className="flex items-center gap-[6px]">
          <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
            Winner: {c.winnerOutcome}
          </span>
          <span className="font-dmMono text-[9px] text-[#a3a3a3]">
            {c.txHash.slice(0, 8)}...
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-[2px] shrink-0">
        <span className="font-overusedGrotesk font-bold text-[16px] text-[#0e0e0e]">
          ${c.rewardAmount.toFixed(2)}
        </span>
        <span className="font-dmMono text-[9px] text-[#a3a3a3] uppercase">reward</span>
      </div>
      <div className="flex flex-col items-end gap-[2px] shrink-0">
        <span className={combineClass(
          "font-dmMono text-[11px] px-[6px] py-[2px] rounded-[4px]",
          c.pnl >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
        )}>
          {c.pnl >= 0 ? "+" : ""}${c.pnl.toFixed(2)}
        </span>
        <span className="font-dmMono text-[9px] text-[#a3a3a3] uppercase">pnl</span>
      </div>
      <div className="flex flex-col items-end gap-[2px] shrink-0">
        <span className="font-dmMono text-[13px] text-[#0e0e0e]">{c.sharesSpent.toFixed(2)}</span>
        <span className="font-dmMono text-[9px] text-[#a3a3a3] uppercase">shares</span>
      </div>
      <span className="font-dmMono text-[11px] text-[#a3a3a3] shrink-0 w-[50px] text-right">
        {timeAgo(c.timestamp)}
      </span>
    </div>
  );
}

export default function MockClaimedRewardsTab({ claims }: { claims: MockClaim[] }) {
  if (claims.length === 0) {
    return (
      <div className="relative bg-[#fdfdfd] rounded-[12px] w-full">
        <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
        <div className="flex flex-col items-center justify-center py-[48px] gap-[8px] relative">
          <span className="font-overusedGrotesk font-semibold text-[16px] text-[#0e0e0e]">No claimed rewards yet.</span>
          <span className="font-dmMono text-[11px] text-[#a3a3a3] uppercase tracking-[0.22px]">Win predictions to earn rewards.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#fdfdfd] rounded-[12px] w-full">
      <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col divide-y divide-[#f0f0f0] p-[8px] relative">
        {claims.map((c, i) => <ClaimCard key={i} c={c} />)}
      </div>
    </div>
  );
}

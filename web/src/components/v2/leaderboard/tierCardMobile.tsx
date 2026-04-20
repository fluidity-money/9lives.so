"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import use9LivesPoints from "@/hooks/use9LivesPoints";
import { TIERS, getTierIndex } from "./demoData";
import svgPaths from "./svgPaths";
import CatLogo from "./catLogo";

export default function TierCardMobile() {
  const account = useAppKitAccount();
  const { data: pointsData } = use9LivesPoints({
    address: account?.address,
    enabled: !!account.address,
  });
  const points = account.isConnected ? (pointsData?.[0]?.amount ?? 0) : 0;
  const currentTierIdx = getTierIndex(points);
  const currentTier = TIERS[currentTierIdx];
  const nextTier = TIERS[Math.min(currentTierIdx + 1, TIERS.length - 1)];
  const ptsToNext = Math.max(nextTier.minPts - points, 0);
  const tierSpan = Math.max(nextTier.minPts - currentTier.minPts, 1);
  const progressPct =
    currentTierIdx === TIERS.length - 1
      ? 100
      : Math.min(((points - currentTier.minPts) / tierSpan) * 100, 100);

  return (
    <div className="bg-[#f5f5f5] rounded-[16px] w-full p-[16px]">
      <div className="border border-[#e0d4eb] rounded-[12px] bg-[#faf5ff] p-[16px]">
        <div className="flex items-center justify-between gap-[12px]">
          {/* Left: Points */}
          <div className="flex items-center gap-[8px]">
            <div className="flex items-center justify-center overflow-clip shrink-0 size-[28px]">
              <svg className="size-full" fill="none" viewBox="0 0 13 13">
                <path d={svgPaths.p110d4800} fill="#8B5CF6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-overusedGrotesk font-bold text-[#0e0e0e] text-[20px] tracking-[-0.4px] leading-tight">
                {points.toLocaleString()}pts
              </span>
              <span className="font-dmMono font-medium text-[#a3a3a3] text-[9px] uppercase tracking-[0.18px]">
                TOTAL POINTS
              </span>
            </div>
          </div>

          {/* Right: Tier + Avatar */}
          <div className="flex items-center gap-[8px]">
            <div className="flex flex-col items-end">
              <span className="font-overusedGrotesk font-semibold text-[#0e0e0e] text-[14px] tracking-[-0.28px]">
                {currentTier.name}
              </span>
              <span className="font-dmMono font-medium text-[#a3a3a3] text-[9px] uppercase tracking-[0.18px]">
                {currentTier.requirement}
              </span>
            </div>
            <div className="shrink-0">
              <CatLogo color="#0e0e0e" size={36} />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-[12px]">
          <div className="h-[28px] relative rounded-[999px] w-full bg-[#e5e5e5] overflow-hidden">
            <div
              className="h-full rounded-[999px] bg-[#0e0e0e] transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-dmMono font-medium text-[#fdfdfd] mix-blend-difference text-[10px] uppercase tracking-[0.2px]">
                {ptsToNext > 0
                  ? `${ptsToNext}PTS UNTIL NEXT TIER`
                  : "MAX TIER REACHED"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

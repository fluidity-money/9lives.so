"use client";

import { useRef, useState, useEffect } from "react";
import makeBlockie from "ethereum-blockies-base64";
import { useAppKitAccount } from "@reown/appkit/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import use9LivesPoints from "@/hooks/use9LivesPoints";
import useMeowDomains from "@/hooks/useMeowDomains";
import {
  useLeaderboardTiers,
  useStreakStatus,
} from "@/hooks/useLeaderboardRewards";
import { getTierIndex, toTierData } from "./demoData";
import type { TierData } from "./types";
import svgPaths from "./svgPaths";

function TierArtwork({
  tier,
  isActive,
  isLocked,
}: {
  tier: TierData;
  isActive: boolean;
  isLocked: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[12px] bg-[#f7f7f7] border transition-all duration-500 ${
        isActive
          ? "size-[96px] border-[#eeeeee] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          : "size-[78px] border-transparent"
      } ${isLocked ? "grayscale opacity-70" : ""}`}
    >
      <img
        src={tier.iconUrl}
        alt={`${tier.name} tier`}
        draggable={false}
        className="size-full object-contain select-none pointer-events-none"
      />
    </div>
  );
}

export default function TierWidget() {
  const account = useAppKitAccount();
  const { connect } = useConnectWallet();

  const { data: pointsData } = use9LivesPoints({
    address: account?.address,
    enabled: !!account.address,
  });
  const { data: domainOrAddress } = useMeowDomains(account.address ?? "");
  const { data: tierDefinitions } = useLeaderboardTiers();
  const { data: streak } = useStreakStatus(account.address);
  const tiers = toTierData(tierDefinitions);

  // When connected, the API returns the current user's entry as index 0.
  // When disconnected, we don't want to show anyone else's data.
  const points = account.isConnected ? (pointsData?.[0]?.amount ?? 0) : 0;
  const currentTierIdx = getTierIndex(points, tiers);
  const currentTier = tiers[currentTierIdx];
  const nextTier = tiers[currentTierIdx + 1];

  // Real tier progression: distance from current tier floor to next tier floor
  const tierFloor = currentTier.minPts;
  const nextFloor = nextTier?.minPts ?? currentTier.minPts;
  const tierSpan = Math.max(nextFloor - tierFloor, 1);
  const progressPct = nextTier
    ? Math.min(((points - tierFloor) / tierSpan) * 100, 100)
    : 100;
  const tierPtsLabel = nextTier
    ? `${Math.max(nextFloor - points, 0)} pts to ${nextTier.name}`
    : "Max tier reached";

  const shortAddress = account.address
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : "";
  // Use meow domain when present, otherwise fall back to the short address.
  // The hook returns the full address when no .meow exists, so shorten anything
  // that doesn't end with .meow.
  const displayName = account.address
    ? domainOrAddress && domainOrAddress.endsWith(".meow")
      ? domainOrAddress
      : shortAddress
    : "Not Connected";

  // Tier carousel
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = 180;
    const gap = 12;
    const containerW = el.clientWidth;
    const targetScroll = currentTierIdx * (cardW + gap) - (containerW - cardW) / 2;
    el.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });
  }, [currentTierIdx]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setDragState({
      isDragging: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = dragState.scrollLeft - (x - dragState.startX);
  };
  const handleMouseUp = () =>
    setDragState((p) => ({ ...p, isDragging: false }));

  return (
    <div className="flex flex-col gap-[12px] h-[320px] items-center justify-center max-w-[414px] relative rounded-[12px] shrink-0 w-full">
      {/* Profile row (real data) */}
      <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] gap-[10px] items-center py-[4px] shrink-0 w-full">
        {/* Avatar — fixed size */}
        {account.address ? (
          <img
            src={makeBlockie(account.address)}
            alt="avatar"
            className="size-[44px] rounded-[8px] border border-[#e5e5e5]"
          />
        ) : (
          <div className="size-[44px] rounded-[8px] bg-[#e5e5e5]" />
        )}

        {/* Identity column — name + tier badge */}
        <div className="flex flex-col gap-[6px] items-start justify-center min-w-0">
          {account.isConnected ? (
            <span className="font-overusedGrotesk font-bold text-[13px] text-[#0e0e0e] whitespace-nowrap truncate w-full">
              {displayName}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => connect()}
              className="font-overusedGrotesk font-bold text-[12px] text-[#fdfdfd] bg-[#0e0e0e] hover:bg-[#2a2a2a] transition-colors rounded-[8px] px-[10px] py-[4px] cursor-pointer whitespace-nowrap"
            >
              Connect Wallet
            </button>
          )}
          <div className="bg-[#ffe8f5] flex items-center justify-center px-[5px] py-[1px] rounded-[6px] shrink-0">
            <div className="flex items-center justify-center overflow-clip p-[2px] shrink-0 size-[14px]">
              <svg className="size-full" fill="none" viewBox="0 0 8 6.54545">
                <path d={svgPaths.p29f36f80} fill="#EA33C2" />
              </svg>
            </div>
            <span className="font-dmMono font-medium text-[#ea33c2] text-[9px] text-center tracking-[0.18px] uppercase whitespace-nowrap">
              {currentTier.name.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Stats column — stacked horizontally on right */}
        <div className="flex gap-[12px] items-start justify-end shrink-0">
          <div className="flex flex-col gap-[2px] items-end justify-center shrink-0">
            <p className="font-dmMono font-medium text-[#a3a3a3] text-[9px] uppercase tracking-[0.2px] whitespace-nowrap">
              Total Points
            </p>
            <div className="flex gap-[4px] items-center justify-end shrink-0">
              <span className="font-overusedGrotesk font-semibold text-[#0e0e0e] text-[18px] tracking-[-0.36px] whitespace-nowrap leading-none">
                {points.toLocaleString()}
              </span>
              <div className="flex items-center justify-center shrink-0 size-[16px]">
                <svg className="size-full" fill="none" viewBox="0 0 13 13">
                  <path d={svgPaths.p110d4800} fill="#EA33C2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[2px] items-end justify-center shrink-0">
            <p className="font-dmMono font-medium text-[#a3a3a3] text-[9px] uppercase tracking-[0.2px] whitespace-nowrap">
              Active Streak
            </p>
            <div className="flex gap-[4px] items-center justify-end shrink-0">
              <span className="font-overusedGrotesk font-semibold text-[#a3a3a3] text-[14px] tracking-[-0.28px] whitespace-nowrap leading-none">
                {streak?.activeStreakDays ?? 0}d
              </span>
              <div className="shrink-0 size-[16px] opacity-70">
                <svg className="size-full" fill="none" viewBox="0 0 21 21">
                  <path d={svgPaths.p3f082c80} fill="#FF5E00" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress to next tier (real data) */}
      <div className="flex flex-col gap-[6px] items-start justify-center shrink-0 w-full">
        <div className="flex font-overusedGrotesk font-medium items-center justify-between text-[14px] w-full whitespace-nowrap">
          <span className="text-[#525252]">Progress to Next Tier</span>
          <span className="text-[#0e0e0e]">{tierPtsLabel}</span>
        </div>
        <div className="h-[6px] relative rounded-[12px] shrink-0 w-full">
          <div className="flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
            <div
              className="bg-[#181818] flex-1 min-h-px min-w-0 rounded-[8px] transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="absolute border border-[#0e0e0e] inset-0 pointer-events-none rounded-[12px]" />
        </div>
      </div>

      {/* Tier carousel */}
      <div className="flex-1 min-h-px min-w-0 relative rounded-[12px] w-full overflow-hidden">
        <div className="absolute bg-lb-pink inset-0 pointer-events-none rounded-[12px]" />
        <div
          ref={scrollRef}
          className="flex items-center gap-[12px] overflow-hidden px-[16px] py-[16px] relative size-full select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {tiers.map((tier, i) => {
            const isActive = i === currentTierIdx;
            const isLocked = i > currentTierIdx;
            return (
              <div
                key={tier.name}
                className={`flex-shrink-0 rounded-[16px] flex flex-col items-center justify-center gap-[8px] transition-all duration-500 select-none ${
                  isActive
                    ? "w-[180px] h-full bg-white shadow-[0_2px_12px_0_rgba(0,0,0,0.08)]"
                    : "w-[160px] h-[90%] opacity-70"
                } ${isLocked ? "bg-[#f0c4df]" : isActive ? "" : "bg-[#f5d0e8]"}`}
              >
                <TierArtwork
                  tier={tier}
                  isActive={isActive}
                  isLocked={isLocked}
                />
                <span
                  className={`font-overusedGrotesk font-semibold text-[14px] tracking-[-0.28px] ${
                    isActive
                      ? "text-[#0e0e0e]"
                      : isLocked
                        ? "text-[#b07a9e]"
                        : "text-[#8b5a7a]"
                  }`}
                >
                  {tier.name}
                </span>
                <span
                  className={`font-dmMono font-medium text-[9px] tracking-[0.18px] uppercase ${
                    isActive
                      ? "text-[#a3a3a3]"
                      : isLocked
                        ? "text-[#c9a0b8]"
                        : "text-[#b07a9e]"
                  }`}
                >
                  {tier.requirement}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.3)]" />
        <div className="absolute border border-[#f0c4df] inset-0 pointer-events-none rounded-[12px]" />
      </div>
    </div>
  );
}

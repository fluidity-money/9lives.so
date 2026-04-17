"use client";

import { useRef, useState, useEffect } from "react";
import type { PState } from "./types";
import { TIERS, getTierIndex } from "./demoData";
import svgPaths from "./svgPaths";
import CatLogo from "./catLogo";

export default function TierWidget({ s }: { s: PState }) {
  const progressPct = Math.min((s.tierPx / 400) * 100, 100);
  const currentTierIdx = getTierIndex(s.totalPts);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, scrollLeft: 0 });

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
    setDragState({ isDragging: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = dragState.scrollLeft - (x - dragState.startX);
  };
  const handleMouseUp = () => setDragState((p) => ({ ...p, isDragging: false }));

  return (
    <div className="flex flex-col gap-[12px] h-[320px] items-center justify-center max-w-[414px] relative rounded-[12px] shrink-0 w-full">
      {/* Profile row */}
      <div className="flex gap-[12px] items-center py-[4px] shrink-0 w-full">
        <div className="flex items-center self-stretch">
          <div className="aspect-square h-full relative rounded-[8px] shrink-0 bg-[#e5e5e5]" />
        </div>
        <div className="flex flex-col gap-[8px] items-start justify-center shrink-0">
          <span className="font-overusedGrotesk font-bold text-[14px] text-[#0e0e0e] whitespace-nowrap">
            0X2PAX...1204
          </span>
          <div className="bg-[#ffe8f5] flex items-center justify-center px-[4px] py-px rounded-[6px]">
            <div className="flex items-center justify-center overflow-clip p-[2px] shrink-0 size-[16px]">
              <svg className="size-full" fill="none" viewBox="0 0 8 6.54545">
                <path d={svgPaths.p29f36f80} fill="#EA33C2" />
              </svg>
            </div>
            <span className="font-dmMono font-medium text-[#ea33c2] text-[9px] text-center tracking-[0.18px] uppercase whitespace-nowrap">
              {TIERS[currentTierIdx].name.toUpperCase()}
            </span>
          </div>
        </div>
        {/* Points + Streak */}
        <div className="flex flex-1 items-center justify-center min-h-px min-w-0">
          <div className="flex flex-1 gap-[16px] items-center justify-center min-h-px min-w-0">
            <div className="flex flex-1 flex-col gap-[2px] items-end justify-center min-h-px min-w-0">
              <p className="font-dmMono font-medium text-[#a3a3a3] text-[11.67px] uppercase whitespace-nowrap">
                Total Points
              </p>
              <div className="flex gap-[4px] items-center justify-end shrink-0">
                <span className="font-overusedGrotesk font-semibold text-[#0e0e0e] text-[20.16px] tracking-[-0.4032px] whitespace-nowrap">
                  {s.totalPts}
                </span>
                <div className="flex items-center justify-center overflow-clip p-[2px] shrink-0 size-[21px]">
                  <svg className="size-full" fill="none" viewBox="0 0 13 13">
                    <path d={svgPaths.p110d4800} fill="#EA33C2" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-[2px] items-end justify-center min-h-px min-w-0">
              <p className="font-dmMono font-medium text-[#a3a3a3] text-[11.67px] uppercase whitespace-nowrap">
                Active Streak
              </p>
              <div className="flex gap-[4px] items-center justify-end shrink-0">
                <span className="font-overusedGrotesk font-semibold text-[#0e0e0e] text-[20.16px] tracking-[-0.4032px] whitespace-nowrap">
                  {s.activeStreak}
                </span>
                <div className="shrink-0 size-[21px]">
                  <svg className="size-full" fill="none" viewBox="0 0 21 21">
                    <path d={svgPaths.p3f082c80} fill="#FF5E00" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Progress to next tier */}
      <div className="flex flex-col gap-[6px] items-start justify-center shrink-0 w-full">
        <div className="flex font-overusedGrotesk font-medium items-center justify-between text-[14px] w-full whitespace-nowrap">
          <span className="text-[#525252]">Progress to Next Tier</span>
          <span className="text-[#0e0e0e]">{s.tierPtsLabel}</span>
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
          className="flex items-center gap-[12px] overflow-x-auto overflow-y-hidden px-[16px] py-[16px] relative size-full cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {TIERS.map((tier, i) => {
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
                <CatLogo color={isActive ? "#0e0e0e" : isLocked ? "#b07a9e" : "#8b5a7a"} size={isActive ? 56 : 44} />
                <span
                  className={`font-overusedGrotesk font-semibold text-[14px] tracking-[-0.28px] ${
                    isActive ? "text-[#0e0e0e]" : isLocked ? "text-[#b07a9e]" : "text-[#8b5a7a]"
                  }`}
                >
                  {tier.name}
                </span>
                <span
                  className={`font-dmMono font-medium text-[9px] tracking-[0.18px] uppercase ${
                    isActive ? "text-[#a3a3a3]" : isLocked ? "text-[#c9a0b8]" : "text-[#b07a9e]"
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

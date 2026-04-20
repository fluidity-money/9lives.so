"use client";

import { useState } from "react";
import Link from "next/link";
import JackpotSection from "./jackpotSection";
import LeaderboardSection from "./leaderboardSection";
import TierWidget from "./tierWidget";
import TierCardMobile from "./tierCardMobile";
import StreakSection from "./streakSection";
import MissionsSection from "./missionsSection";
import MobileMenuButton from "../mobileMenuButton";

function MobileTabSwitcher({
  activeTab,
  onTabChange,
}: {
  activeTab: "leaderboard" | "streaks";
  onTabChange: (tab: "leaderboard" | "streaks") => void;
}) {
  return (
    <div className="flex w-full border-b border-[#e5e5e5] bg-[#fdfdfd] sticky top-[48px] z-20">
      {(
        [
          { key: "leaderboard", label: "🏆 Leaderboard", icon: "" },
          { key: "streaks", label: "🔥 Streaks & Missions", icon: "" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.key}
          className={`flex-1 py-[14px] text-center font-dmMono font-medium text-[11px] uppercase tracking-[0.22px] transition-colors relative cursor-pointer ${
            activeTab === tab.key
              ? "text-[#0e0e0e]"
              : "text-[#a3a3a3]"
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0e0e0e]" />
          )}
        </button>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [mobileTab, setMobileTab] = useState<"leaderboard" | "streaks">(
    "leaderboard",
  );

  return (
    <>
      {/* ===== MOBILE LAYOUT (below md) ===== */}
      <div className="md:hidden flex flex-col w-full bg-[#fdfdfd] overflow-x-hidden pb-[72px]">
        <JackpotSection />
        <MobileTabSwitcher activeTab={mobileTab} onTabChange={setMobileTab} />

        {mobileTab === "leaderboard" ? (
          <div className="px-[12px] py-[12px] w-full">
            <LeaderboardSection />
          </div>
        ) : (
          <div className="flex flex-col gap-[12px] p-[12px] w-full">
            <StreakSection />
            <TierCardMobile />
            <p className="font-overusedGrotesk font-medium text-[#525252] text-[14px] text-center">
              Earn points by doing missions:
            </p>
            <MissionsSection />
          </div>
        )}

        {/* Fixed bottom bar — reuses existing MobileMenuButton */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#fdfdfd] border-t border-[#e5e5e5] px-[16px] py-[10px] flex items-center gap-[8px] md:hidden">
          <Link
            href="/"
            className="flex-1 bg-[#0e0e0e] text-[#fdfdfd] rounded-[12px] py-[14px] text-center font-overusedGrotesk font-semibold text-[15px]"
          >
            Predict
          </Link>
          <MobileMenuButton />
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (md and above) ===== */}
      <div className="hidden md:flex md:flex-col items-center justify-center relative size-full bg-[#fdfdfd]">
        <div className="bg-[#fafafa] flex flex-col lg:flex-row flex-[1_0_0] items-start justify-center min-h-px min-w-0 overflow-clip relative w-full">
          {/* Left content — independent scroll */}
          <div className="flex flex-[1_0_0] flex-col gap-[12px] lg:h-full items-start min-h-px min-w-0 relative lg:overflow-y-auto w-full">
            <JackpotSection />
            <div className="relative shrink-0 w-full">
              <div className="flex justify-center size-full">
                <div className="flex items-start justify-center pb-[24px] px-[16px] relative size-full">
                  <LeaderboardSection />
                </div>
              </div>
            </div>
          </div>
          {/* Right sidebar — independent scroll */}
          <div className="bg-[#f5f5f5] lg:h-full relative shrink-0 lg:overflow-y-auto w-full lg:w-auto overflow-x-hidden">
            <div className="flex flex-col gap-[12px] items-start p-[16px] relative w-full lg:w-[414px]">
              <TierWidget />
              <StreakSection />
              <MissionsSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

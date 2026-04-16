"use client";

import { useState } from "react";
import { STATES } from "./demoData";
import JackpotSection from "./jackpotSection";
import LeaderboardSection from "./leaderboardSection";
import TierWidget from "./tierWidget";
import StreakSection from "./streakSection";
import MissionsSection from "./missionsSection";
import ProgressionController from "./progressionController";

export default function LeaderboardPage() {
  const [level, setLevel] = useState(0);
  const s = STATES[level];

  return (
    <div className="bg-[#fdfdfd] flex flex-col items-center justify-center relative size-full">
      <div className="bg-[#fafafa] flex flex-col lg:flex-row flex-[1_0_0] items-start justify-center min-h-px min-w-px overflow-clip relative w-full">
        {/* Left content — independent scroll */}
        <div className="flex flex-[1_0_0] flex-col gap-[12px] lg:h-full items-start min-h-px min-w-px relative lg:overflow-y-auto w-full">
          <JackpotSection s={s} />
          <div className="relative shrink-0 w-full">
            <div className="flex justify-center size-full">
              <div className="flex items-start justify-center pb-[24px] px-[16px] relative size-full">
                <LeaderboardSection />
              </div>
            </div>
          </div>
        </div>
        {/* Right sidebar — independent scroll */}
        <div className="bg-[#f5f5f5] lg:h-full relative shrink-0 lg:overflow-y-auto w-full lg:w-auto">
          <div className="flex flex-col gap-[12px] items-start p-[16px] relative w-full lg:w-[414px]">
            <TierWidget s={s} />
            <StreakSection s={s} />
            <MissionsSection s={s} />
          </div>
        </div>
      </div>
      <ProgressionController level={level} setLevel={setLevel} />
    </div>
  );
}

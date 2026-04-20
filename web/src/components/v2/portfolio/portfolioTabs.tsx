"use client";

import { useState } from "react";
import { combineClass } from "@/utils/combineClass";
import PositionsTab from "./positionsTab";
import ActivityTab from "./activityTab";
import CampaignsTab from "./campaignsTab";
import ClaimedRewardsTab from "./claimedRewardsTab";
import LpCampaignsTab from "./lpCampaignsTab";

const tabs = ["Positions", "Activity", "Campaigns", "Claimed", "LP"];

function PortfolioTabStrip({
  activeIdx,
  onSelect,
}: {
  activeIdx: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <div
      className="relative flex flex-row items-center rounded-xl bg-neutral-200 p-1 shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.70)] gap-[2px]
                 overflow-x-auto md:overflow-visible
                 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                 snap-x snap-mandatory md:snap-none"
    >
      {tabs.map((title, index) => {
        const isActive = index === activeIdx;
        return (
          <button
            key={title}
            type="button"
            onClick={() => onSelect(index)}
            className={combineClass(
              "z-10 cursor-pointer text-center text-sm transition-all duration-200",
              // Mobile: auto-width, shrink-0 so text doesn't collide; desktop: equal flex-1
              "shrink-0 md:flex-1 snap-start",
              "whitespace-nowrap px-[14px] py-[6px] rounded-lg",
              isActive
                ? "bg-2white text-2black font-medium shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)]"
                : "text-neutral-400 hover:text-neutral-600",
            )}
          >
            {title}
          </button>
        );
      })}
    </div>
  );
}

export default function PortfolioTabs() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="flex flex-col gap-[16px]">
      <PortfolioTabStrip activeIdx={activeIdx} onSelect={setActiveIdx} />
      {activeIdx === 0 && <PositionsTab />}
      {activeIdx === 1 && <ActivityTab />}
      {activeIdx === 2 && <CampaignsTab />}
      {activeIdx === 3 && <ClaimedRewardsTab />}
      {activeIdx === 4 && <LpCampaignsTab />}
    </div>
  );
}

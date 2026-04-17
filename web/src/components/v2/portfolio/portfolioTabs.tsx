"use client";

import { useState } from "react";
import GroupButton from "../groupButton";
import PositionsTab from "./positionsTab";
import ActivityTab from "./activityTab";
import CampaignsTab from "./campaignsTab";
import ClaimedRewardsTab from "./claimedRewardsTab";
import LpCampaignsTab from "./lpCampaignsTab";

const tabs = ["Positions", "Activity", "Campaigns", "Rewards", "LP"];

export default function PortfolioTabs() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="flex flex-col gap-[16px]">
      <GroupButton
        buttons={tabs.map((t, i) => ({ title: t, callback: () => setActiveIdx(i) }))}
        initialIdx={0}
        variant="small"
      />
      {activeIdx === 0 && <PositionsTab />}
      {activeIdx === 1 && <ActivityTab />}
      {activeIdx === 2 && <CampaignsTab />}
      {activeIdx === 3 && <ClaimedRewardsTab />}
      {activeIdx === 4 && <LpCampaignsTab />}
    </div>
  );
}

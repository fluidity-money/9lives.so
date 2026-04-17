"use client";

import { useState } from "react";
import GroupButton from "../groupButton";
import PositionsTab from "./positionsTab";
import ActivityTab from "./activityTab";
import CampaignsTab from "./campaignsTab";
import ClaimedRewardsTab from "./claimedRewardsTab";
import LpCampaignsTab from "./lpCampaignsTab";
import MockPositionsTab from "./mockPositionsTab";
import MockActivityTab from "./mockActivityTab";
import MockClaimedRewardsTab from "./mockClaimedRewardsTab";
import MockLpTab from "./mockLpTab";
import type { MockPortfolioState } from "./mockData";

const tabs = ["Positions", "Activity", "Campaigns", "Rewards", "LP"];

export default function PortfolioTabs({ mockState }: { mockState?: MockPortfolioState }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const useMock = mockState && mockState.positions.length > 0;

  return (
    <div className="flex flex-col gap-[16px]">
      <GroupButton
        buttons={tabs.map((t, i) => ({ title: t, callback: () => setActiveIdx(i) }))}
        initialIdx={0}
        variant="small"
      />
      {activeIdx === 0 && (useMock ? <MockPositionsTab positions={mockState.positions} /> : <PositionsTab />)}
      {activeIdx === 1 && (useMock ? <MockActivityTab activities={mockState.activities} /> : <ActivityTab />)}
      {activeIdx === 2 && <CampaignsTab />}
      {activeIdx === 3 && (useMock ? <MockClaimedRewardsTab claims={mockState.claims} /> : <ClaimedRewardsTab />)}
      {activeIdx === 4 && (useMock ? <MockLpTab lps={mockState.lps} /> : <LpCampaignsTab />)}
    </div>
  );
}

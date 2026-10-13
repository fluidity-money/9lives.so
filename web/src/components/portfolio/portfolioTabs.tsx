"use client";

import ActivityTable from "@/components/activity/activityTable";
import UserCampaignsList from "@/components/campaign/userCampaignsList";
import UserLpedCampaignsList from "@/components/campaign/lpedCampaigns";
import ClaimedRewardsTable from "@/components/claimedRewards/claimedRewardsTable";
import PositionTable from "@/components/position/positionTable";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

const tabClassName =
  "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-neutral-500 outline-none transition-colors data-[selected]:bg-2black data-[selected]:text-2white hover:text-2black";

export default function PortfolioTabs() {
  return (
    <TabGroup className="flex flex-col gap-3">
      <TabList className="flex gap-1 overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-1.5">
        <Tab className={tabClassName}>Positions</Tab>
        <Tab className={tabClassName}>Activity</Tab>
        <Tab className={tabClassName}>Campaigns</Tab>
        <Tab className={tabClassName}>Rewards</Tab>
        <Tab className={tabClassName}>Liquidity</Tab>
      </TabList>
      <TabPanels>
        <TabPanel className="overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-3 md:p-4">
          <PositionTable modern />
        </TabPanel>
        <TabPanel className="overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-3 md:p-4">
          <ActivityTable modern />
        </TabPanel>
        <TabPanel className="overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-3 md:p-4">
          <UserCampaignsList />
        </TabPanel>
        <TabPanel className="overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-3 md:p-4">
          <ClaimedRewardsTable modern />
        </TabPanel>
        <TabPanel className="overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-3 md:p-4">
          <UserLpedCampaignsList modern />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

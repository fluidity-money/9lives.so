"use client";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import LeaderTable from "./leaderTable";
import { combineClass } from "@/utils/combineClass";
import useLeaderboard from "@/hooks/useLeaderboard";
import useLeaderBoardCategories from "@/hooks/useLeaderBoardCategories";

export default function LeaderTabScene({
  isDegenModeEnabled,
}: {
  isDegenModeEnabled: boolean;
}) {
  const { data: generalData } = useLeaderboard();
  const { data: categoriesData } = useLeaderBoardCategories();
  return (
    <TabGroup
      className={combineClass(
        isDegenModeEnabled ? "xl:absolute" : "md:absolute",
        "inset-0",
      )}
    >
      <TabList className="flex items-center overflow-x-auto">
        <Tab as={Fragment}>
          {(props) => <TabButton title="Global" {...props} />}
        </Tab>
        <Tab as={Fragment}>
          {(props) => <TabButton title="Referrers" {...props} />}
        </Tab>
        <Tab as={Fragment}>
          {(props) => <TabButton title="Creators" {...props} />}
        </Tab>
        <Tab as={Fragment}>
          {(props) => <TabButton title="Volume" {...props} />}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <LeaderTable data={generalData} />
        </TabPanel>
        <TabPanel>
          <LeaderTable data={categoriesData?.referrers} />
        </TabPanel>
        <TabPanel>
          <LeaderTable data={categoriesData?.creators} />
        </TabPanel>
        <TabPanel>
          <LeaderTable data={categoriesData?.volume} />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

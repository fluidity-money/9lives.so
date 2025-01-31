"use client";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import LeaderTable from "./leaderTable";
import Button from "../themed/button";

export default function LeaderTabScene({
  scrollToAchievments,
}: {
  scrollToAchievments: () => void;
}) {
  return (
    <TabGroup>
      <TabList className="flex items-end justify-between">
        <Tab as={Fragment}>
          {(props) => <TabButton title="Global" {...props} />}
        </Tab>
        <Button
          intent={"default"}
          onClick={scrollToAchievments}
          className={"md:hidden"}
          title="Achievments"
        />
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="md:h-[554px] md:overflow-y-scroll">
            <LeaderTable />
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

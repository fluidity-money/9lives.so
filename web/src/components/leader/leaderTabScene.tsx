"use client";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import LeaderTable from "./leaderTable";
import Button from "../themed/button";
import { combineClass } from "@/utils/combineClass";

export default function LeaderTabScene({
  scrollToAchievments,
  isDegenModeEnabled,
}: {
  scrollToAchievments: () => void;
  isDegenModeEnabled: boolean;
}) {
  return (
    <TabGroup
      className={combineClass(
        isDegenModeEnabled ? "xl:absolute" : "md:absolute",
        "inset-0",
      )}
    >
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
          <div className="">
            <LeaderTable />
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

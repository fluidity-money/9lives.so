"use client";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import LeaderTable from "./leaderTable";

export default function LeaderTabScene() {
  return (
    <TabGroup>
      <TabList className="flex">
        <Tab as={Fragment}>
          {(props) => <TabButton title="Global" {...props} />}
        </Tab>
        <Tab as={Fragment} disabled>
          {(props) => <TabButton title="Friends on X" {...props} />}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="h-[554px] overflow-y-scroll">
            <LeaderTable />
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

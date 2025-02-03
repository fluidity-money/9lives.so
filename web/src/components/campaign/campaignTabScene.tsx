"use client";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import CampaignList from "./campaignList";

export default function CampaignTabScene() {
  return (
    <TabGroup>
      <TabList className="mb-4 flex items-end border-b border-b-9black">
        <Tab as={Fragment}>
          {(props) => <TabButton title="All" {...props} />}
        </Tab>
        <Tab as={Fragment} disabled>
          {(props) => <TabButton title="More Soon..." {...props} />}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <CampaignList />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

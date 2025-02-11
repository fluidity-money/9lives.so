"use client";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment, useState } from "react";
import CampaignList from "./campaignList";
import WatchList from "./watchList";
import config from "@/config";
export default function CampaignTabScene() {
  const [categoryIdx, setCategoryIdx] = useState(0);

  return (
    <TabGroup
      selectedIndex={categoryIdx}
      onChange={(idx) => setCategoryIdx(idx)}
    >
      <TabList className="mb-4 flex items-end border-b border-b-9black">
        {config.categories.map((cat) => (
          <Tab as={Fragment} key={"tab_btn_" + cat}>
            {(props) => <TabButton title={cat} {...props} />}
          </Tab>
        ))}
        <Tab as={Fragment}>
          {(props) => (
            <TabButton title="My Watchlist" {...props} watchlist={true} />
          )}
        </Tab>
      </TabList>
      <TabPanels>
        {config.categories.map((cat) => (
          <TabPanel key={"tab_panel_" + cat}>
            <CampaignList
              category={cat === config.categories[0] ? undefined : cat}
            />
          </TabPanel>
        ))}
        <TabPanel>
          <WatchList />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

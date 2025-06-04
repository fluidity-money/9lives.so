"use client";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment, useState } from "react";
import CampaignList from "./campaignList";
import WatchList from "./watchList";
import config from "@/config";
import { CampaignFilters } from "@/types";
import FeaturedCampaign from "./featuredCampaigns";
export default function CampaignTabScene() {
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [orderBy, setOrderBy] = useState<CampaignFilters["orderBy"]>("volume");
  return (
    <TabGroup
      selectedIndex={categoryIdx}
      onChange={(idx) => setCategoryIdx(idx)}
    >
      <div className="relative h-[42px] overflow-x-auto">
        <TabList className="absolute inset-x-0 top-0 flex items-end border-b border-b-9black">
          <Tab as={Fragment}>
            {(props) => <TabButton title="Trending" {...props} />}
          </Tab>
          {config.categories.map((cat) => (
            <Tab as={Fragment} key={"tab_btn_" + cat}>
              {(props) => <TabButton title={cat} {...props} />}
            </Tab>
          ))}
          <Tab as={Fragment}>
            {(props) => (
              <TabButton title="My Watchlist" {...props} intent="watchlist" />
            )}
          </Tab>
        </TabList>
      </div>
      <TabPanels>
        <TabPanel>
          <FeaturedCampaign />
        </TabPanel>
        {config.categories.map((cat) => (
          <TabPanel key={"tab_panel_" + cat}>
            <CampaignList
              orderBy={orderBy}
              setOrderBy={setOrderBy}
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

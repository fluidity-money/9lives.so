"use client";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import CampaignList from "./campaignList";
import WatchList from "./watchList";
import config from "@/config";
import { useNavStore } from "@/stores/navStore";
import { Campaign } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import TimebasedCampaignList from "./timebasedCampaignList";
export default function CampaignTabScene({
  initialData,
}: {
  initialData: Campaign[];
}) {
  const { categoryIdx, orderBy, setCategoryIdx, setOrderBy } = useNavStore();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (initialData) {
      queryClient.setQueryData(
        ["campaigns", undefined, "trending", "", undefined, false],
        () => ({
          pages: [initialData],
          pageParams: [0],
        }),
      );
    }
  }, [initialData, queryClient]);

  return (
    <TabGroup
      selectedIndex={categoryIdx}
      onChange={(idx) => setCategoryIdx(idx)}
    >
      <div className="relative h-[42px] overflow-x-auto">
        <TabList className="absolute inset-x-0 top-0 flex items-end border-b border-b-9black">
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
        {config.categories.map((cat) => (
          <TabPanel key={"tab_panel_" + cat}>
            {cat === "Hourly" || cat === "15mins" || cat === "5mins" ? (
              <TimebasedCampaignList category={cat} />
            ) : (
              <CampaignList
                orderBy={orderBy}
                setOrderBy={setOrderBy}
                category={cat === config.categories[0] ? undefined : cat}
              />
            )}
          </TabPanel>
        ))}
        <TabPanel>
          <WatchList />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

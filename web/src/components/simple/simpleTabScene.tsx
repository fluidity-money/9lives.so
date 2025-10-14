"use client";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import config from "@/config";

export default function SimpleTabScene() {
  return (
    <TabGroup>
      <div className="relative h-[42px] overflow-x-auto">
        <TabList className="absolute inset-x-0 top-0 flex items-end border-b border-b-9black">
          {config.simpleMarkets.map((cat) => (
            <Tab as={Fragment} key={"tab_btn_" + cat}>
              {(props) => <TabButton title={cat} {...props} />}
            </Tab>
          ))}
        </TabList>
      </div>
      <TabPanels>
        {config.simpleMarkets.map((cat) => (
          <TabPanel key={"tab_panel_" + cat}>
            <div>This is {cat}</div>
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}

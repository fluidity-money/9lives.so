import { Outcome } from "@/types";
import PositionsBody from "./positionsBody";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import ShadowCard from "../cardShadow";
interface PositionsProps {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
}
export default function Positions({ tradingAddr, outcomes }: PositionsProps) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const tablesHeaders = [
    "Position",
    "Amount of Shares",
    "Value of Shares",
    "Actions",
  ];
  return (
    <TabGroup>
      <TabList>
        <Tab as={Fragment}>
          {(props) => <TabButton title="My Campaign Positions" {...props} />}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ShadowCard className="rounded-tl-none p-5">
            <table className="w-full table-auto border-separate border-spacing-y-1">
              <thead>
                <tr className="font-geneva">
                  {tablesHeaders.map((key) => (
                    <th className={tableHeaderClasses} key={key}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <PositionsBody tradingAddr={tradingAddr} outcomes={outcomes} />
            </table>
          </ShadowCard>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

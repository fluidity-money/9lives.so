import PositionTable from "@/components/position/positionTable";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import ShadowCard from "../cardShadow";
import { Outcome } from "@/types";
interface AssetSceneProps {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
}
export default function AssetScene({ tradingAddr, outcomes }: AssetSceneProps) {
  return (
    <TabGroup>
      <TabList>
        <Tab as={Fragment}>
          {(props) => <TabButton title="My Campaign Positions" {...props} />}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ShadowCard className="rounded-tl-none p-3 md:p-5">
            <PositionTable tradingAddr={tradingAddr} outcomes={outcomes} />
          </ShadowCard>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

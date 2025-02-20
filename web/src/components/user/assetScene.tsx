import PositionTable from "@/components/position/positionTable";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import ShadowCard from "../cardShadow";
import { PositionsProps } from "@/types";
interface AssetSceneProps {
  positionGrops: PositionsProps[];
}
export default function AssetScene({ positionGrops }: AssetSceneProps) {
  return (
    <TabGroup className={"flex-1"}>
      <TabList>
        <Tab as={Fragment}>
          {(props) => <TabButton title="My Positions" {...props} />}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ShadowCard className="rounded-tl-none p-3 md:p-5">
            <PositionTable positionGroups={positionGrops} />
          </ShadowCard>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

import PositionTable from "@/components/position/positionTable";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import ShadowCard from "../cardShadow";
import { PositionsProps } from "@/types";
import ActivityTable from "../activity/activityTable";
interface AssetSceneProps {
  positionGrops: PositionsProps[];
  areGroupsLoading?: boolean;
  campaignId?: string;
}
export default function AssetScene({
  positionGrops,
  areGroupsLoading,
  campaignId,
}: AssetSceneProps) {
  return (
    <TabGroup className={"flex-1"}>
      <TabList className="flex-items flex">
        <Tab as={Fragment}>
          {(props) => <TabButton title="My Positions" {...props} />}
        </Tab>
        <Tab as={Fragment}>
          {(props) => <TabButton title="My Activities" {...props} />}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ShadowCard className="rounded-tl-none p-3 md:p-5">
            <PositionTable
              positionGroups={positionGrops}
              areGroupsLoading={areGroupsLoading}
            />
          </ShadowCard>
        </TabPanel>
        <TabPanel>
          <ShadowCard className="rounded-tl-none p-3 md:p-5">
            <ActivityTable campaignId={campaignId} />
          </ShadowCard>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

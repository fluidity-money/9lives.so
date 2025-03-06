import PositionTable from "@/components/position/positionTable";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import ShadowCard from "../cardShadow";
import { PositionsProps } from "@/types";
import ActivityTable from "../activity/activityTable";
import UserCampaignsList from "../campaign/userCampaignsList";
interface AssetSceneProps {
  positionGrops: PositionsProps[];
  areGroupsLoading?: boolean;
  campaignId?: string;
  detailPage?: boolean;
}
export default function AssetScene({
  positionGrops,
  areGroupsLoading,
  campaignId,
  detailPage = false,
}: AssetSceneProps) {
  return (
    <TabGroup className={"flex-1"}>
      <TabList className="flex items-center">
        <Tab as={Fragment}>
          {(props) => <TabButton title="My Positions" {...props} />}
        </Tab>
        <Tab as={Fragment}>
          {(props) => <TabButton title="My Activities" {...props} />}
        </Tab>
        {detailPage ? null : (
          <Tab as={Fragment}>
            {(props) => <TabButton title="My Campaigns" {...props} />}
          </Tab>
        )}
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
        {detailPage ? null : (
          <TabPanel>
            <ShadowCard className="rounded-tl-none p-3 md:p-5">
              <UserCampaignsList />
            </ShadowCard>
          </TabPanel>
        )}
      </TabPanels>
    </TabGroup>
  );
}

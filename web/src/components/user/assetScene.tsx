import PositionTable from "@/components/position/positionTable";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import ShadowCard from "../cardShadow";
import { ParticipatedCampaign } from "@/types";
import ActivityTable from "../activity/activityTable";
import UserCampaignsList from "../campaign/userCampaignsList";
import ClaimedRewardsTable from "../claimedRewards/claimedRewardsTable";
import UserLpedCampaignsList from "../campaign/lpedCampaigns";
interface AssetSceneProps {
  positionGroups?: ParticipatedCampaign[];
  areGroupsLoading?: boolean;
  campaignId?: string;
  detailPage?: boolean;
  isDetailDpm: boolean | null;
}
export default function AssetScene({
  positionGroups,
  areGroupsLoading,
  campaignId,
  isDetailDpm,
  detailPage = false,
}: AssetSceneProps) {
  return (
    <TabGroup className={"mb-10 flex-1"}>
      <TabList className="flex items-center overflow-y-auto">
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
        <Tab as={Fragment}>
          {(props) => <TabButton title="Claimed Rewards" {...props} />}
        </Tab>
        {detailPage ? null : (
          <Tab as={Fragment}>
            {(props) => <TabButton title="My LP Campaigns" {...props} />}
          </Tab>
        )}
      </TabList>
      <TabPanels className={"md:min-w-[480px]"}>
        <TabPanel>
          <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
            {positionGroups ? (
              <PositionTable
                isDetailDpm={isDetailDpm}
                detailPage={detailPage}
                positionGroups={positionGroups}
                areGroupsLoading={areGroupsLoading}
              />
            ) : null}
          </ShadowCard>
        </TabPanel>
        <TabPanel>
          <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
            <ActivityTable campaignId={campaignId} />
          </ShadowCard>
        </TabPanel>
        {detailPage ? null : (
          <TabPanel>
            <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
              <UserCampaignsList />
            </ShadowCard>
          </TabPanel>
        )}
        <TabPanel>
          <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
            <ClaimedRewardsTable campaignId={campaignId} />
          </ShadowCard>
        </TabPanel>
      </TabPanels>
      {detailPage ? null : (
        <TabPanel>
          <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
            <UserLpedCampaignsList />
          </ShadowCard>
        </TabPanel>
      )}
    </TabGroup>
  );
}

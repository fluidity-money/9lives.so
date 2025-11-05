import PositionTable from "@/components/position/positionTable";
import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import ShadowCard from "../cardShadow";
import ActivityTable from "../activity/activityTable";
import UserCampaignsList from "../campaign/userCampaignsList";
import ClaimedRewardsTable from "../claimedRewards/claimedRewardsTable";
import UserLpedCampaignsList from "../campaign/lpedCampaigns";
import { CampaignDetail } from "@/types";
interface AssetSceneProps {
  campaignDetail?: CampaignDetail;
}
export default function AssetScene({ campaignDetail }: AssetSceneProps) {
  return (
    <TabGroup className={"mb-10 flex-1"}>
      <TabList className="flex items-center overflow-y-auto">
        <Tab as={Fragment}>
          {(props) => <TabButton title="My Positions" {...props} />}
        </Tab>
        <Tab as={Fragment}>
          {(props) => <TabButton title="My Activities" {...props} />}
        </Tab>
        {campaignDetail ? null : (
          <Tab as={Fragment}>
            {(props) => <TabButton title="My Campaigns" {...props} />}
          </Tab>
        )}
        <Tab as={Fragment}>
          {(props) => <TabButton title="Claimed Rewards" {...props} />}
        </Tab>
        {campaignDetail ? null : (
          <Tab as={Fragment}>
            {(props) => <TabButton title="My LP Campaigns" {...props} />}
          </Tab>
        )}
      </TabList>
      <TabPanels className={"md:min-w-[480px]"}>
        <TabPanel>
          <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
            <PositionTable campaignDetail={campaignDetail} />
          </ShadowCard>
        </TabPanel>
        <TabPanel>
          <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
            <ActivityTable campaignId={campaignDetail?.identifier} />
          </ShadowCard>
        </TabPanel>
        {campaignDetail ? null : (
          <TabPanel>
            <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
              <UserCampaignsList />
            </ShadowCard>
          </TabPanel>
        )}
        <TabPanel>
          <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
            <ClaimedRewardsTable campaignId={campaignDetail?.identifier} />
          </ShadowCard>
        </TabPanel>
      </TabPanels>
      {campaignDetail ? null : (
        <TabPanel>
          <ShadowCard className="overflow-x-scroll rounded-tl-none p-3 md:overflow-x-auto md:p-5">
            <UserLpedCampaignsList />
          </ShadowCard>
        </TabPanel>
      )}
    </TabGroup>
  );
}

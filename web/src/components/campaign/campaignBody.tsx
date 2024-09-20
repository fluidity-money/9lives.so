import CampaignItemHeader from "./campaignItemHeader";
import CampaignItemOutcomes from "./campaignItemOutcomes";
import CampaignItemFooter from "./campaignItemFooter";
import { Campaign, SelectedOutcome } from "@/types";

export default function CampaignBody({
  data,
  setSelectedBet,
}: {
  data: Campaign;
  setSelectedBet: React.Dispatch<SelectedOutcome>;
}) {
  return (
    <>
      <CampaignItemHeader
        name={data.name}
        identifier={data.identifier}
        solo={data.outcomes.length === 1}
        soloRatio={32}
      />
      <CampaignItemOutcomes
        campaignId={data.identifier}
        outcomes={data.outcomes}
        setSelectedBet={setSelectedBet}
      />
      <CampaignItemFooter />
    </>
  );
}

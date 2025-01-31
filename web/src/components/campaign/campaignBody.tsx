import CampaignItemHeader from "./campaignItemHeader";
import CampaignItemOutcomes from "./campaignItemOutcomes";
import CampaignItemFooter from "./campaignItemFooter";
import { Campaign, SelectedOutcome } from "@/types";

export default function CampaignBody({
  data,
  setSelectedOutcome,
}: {
  data: Campaign;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
}) {
  return (
    <>
      <CampaignItemHeader
        name={data.name}
        identifier={data.identifier}
        picture={data.picture}
        solo={data.outcomes.length === 1}
        soloRatio={32}
      />
      <div className="flex flex-col">
        <CampaignItemOutcomes
          isConcluded={Boolean(data.winner)}
          isYesNo={data.isYesNo}
          campaignId={data.identifier}
          outcomes={data.outcomes}
          setSelectedOutcome={setSelectedOutcome}
        />
        <CampaignItemFooter volume={data.totalVolume} />
      </div>
    </>
  );
}

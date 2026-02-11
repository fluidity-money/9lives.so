import CampaignItemHeader from "./campaignItemHeader";
import CampaignItemOutcomes from "./campaignItemOutcomes";
import CampaignItemFooter from "./campaignItemFooter";
import { Campaign } from "@/types";

export default function CampaignBody({ data }: { data: Campaign }) {
  return (
    <>
      <CampaignItemHeader
        name={data.name}
        identifier={data.identifier}
        picture={data.picture}
        isDppm={data.isDppm}
        priceMetadata={data.priceMetadata}
      />
      <div className="flex max-h-[118px] flex-col justify-end gap-2">
        <CampaignItemOutcomes
          isConcluded={Boolean(data.winner)}
          isYesNo={data.isYesNo}
          isDppm={data.isDppm}
          odds={data.odds && JSON.parse(data.odds)}
          campaignId={data.identifier}
          shares={data.shares}
          outcomes={data.outcomes}
        />
        <CampaignItemFooter data={data} />
      </div>
    </>
  );
}

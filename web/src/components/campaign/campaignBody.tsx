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
  const dppmName = `${data.priceMetadata?.baseAsset} above $${data.priceMetadata?.priceTargetForUp} on ${new Date(data.ending).toLocaleString("default", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
  return (
    <>
      <CampaignItemHeader
        name={data.isDppm ? dppmName : data.name}
        identifier={data.identifier}
        picture={data.picture}
      />
      <div className="flex max-h-[118px] flex-col justify-end gap-2">
        <CampaignItemOutcomes
          isConcluded={Boolean(data.winner)}
          isYesNo={data.isYesNo}
          isDppm={data.isDppm}
          campaignId={data.identifier}
          shares={data.shares}
          outcomes={data.outcomes}
          setSelectedOutcome={setSelectedOutcome}
        />
        <CampaignItemFooter data={data} />
      </div>
    </>
  );
}

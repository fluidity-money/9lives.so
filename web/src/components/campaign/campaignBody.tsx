import CampaignItemHeader from "./campaignItemHeader";
import CampaignItemOutcomes from "./campaignItemOutcomes";
import CampaignItemFooter from "./campaignItemFooter";
import { Campaign, SelectedOutcome } from "@/types";
import formatDppmName from "@/utils/format/formatDppmName";

export default function CampaignBody({
  data,
  setSelectedOutcome,
}: {
  data: Campaign;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
}) {
  let name = "";
  if (data.isDppm && data.priceMetadata) {
    name = formatDppmName({
      symbol: data.priceMetadata.baseAsset,
      price: data.priceMetadata?.priceTargetForUp ?? "0",
      end: data.ending,
    });
  } else {
    name = data.name;
  }
  return (
    <>
      <CampaignItemHeader
        name={name}
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

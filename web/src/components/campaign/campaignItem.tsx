import { CampaignListQuery } from "@/gql/graphql";
import CampaignItemHeader from "./campaignItemHeader";
import CampaignItemOutcomes from "./campaignItemOutcomes";
import CampaignItemFooter from "./campaignItemFooter";

interface CampaignItemProps {
  data: CampaignListQuery["campaigns"][number];
}

export default function CampaignItem({ data }: CampaignItemProps) {
  return (
    <div className="rounded-md border border-black/10 p-3 shadow-md">
      <CampaignItemHeader name={data.name} identifier={data.identifier} />
      <CampaignItemOutcomes outcomes={data.outcomes} />
      <CampaignItemFooter />
    </div>
  );
}

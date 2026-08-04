import CampaignTabScene from "@/components/campaign/campaignTabScene";
import { requestCampaignList } from "@/providers/graphqlClient";
import { formatCampaign } from "@/utils/format/formatCampaign";

export const revalidate = 3600;

export default async function AdvancedModeHomepage() {
  const rawCampaigns = await requestCampaignList({
    pageSize: 32,
    orderBy: "trending",
  });
  const initialData = rawCampaigns.map((c) => formatCampaign(c));

  return (
    <section>
      <CampaignTabScene initialData={initialData} />
    </section>
  );
}

import CampaignTabScene from "@/components/campaign/campaignTabScene";
import { getCachedCampaigns } from "@/serverData/getCampaigns";

export default async function AdvancedModeHomepage() {
  const initialData = await getCachedCampaigns();

  return (
    <section>
      <CampaignTabScene initialData={initialData} />
    </section>
  );
}

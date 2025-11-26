import CampaignTabScene from "@/components/campaign/campaignTabScene";
import { getCachedCampaigns } from "@/serverData/getCampaigns";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdvancedModeHomepage() {
  const initialData = await getCachedCampaigns();
  const cookieStore = await cookies();
  const mode = cookieStore.get("advanced-mode")?.value;
  if (!mode || mode === "false") {
    return redirect("/simple/campaign/paxg/hourly");
  }

  return (
    <section>
      <CampaignTabScene initialData={initialData} />
    </section>
  );
}

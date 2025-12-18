import CampaignTabScene from "@/components/campaign/campaignTabScene";
import { getCachedCampaigns } from "@/serverData/getCampaigns";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdvancedModeHomepage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const initialData = await getCachedCampaigns();
  const cookieStore = await cookies();
  const mode = cookieStore.get("advanced-mode")?.value;
  const referral = (await searchParams)?.referral;
  if (!mode || mode === "false") {
    return redirect(
      `/simple/campaign/btc/15mins${referral ? `?referral=${referral}` : ""}`,
    );
  }

  return (
    <section>
      <CampaignTabScene initialData={initialData} />
    </section>
  );
}

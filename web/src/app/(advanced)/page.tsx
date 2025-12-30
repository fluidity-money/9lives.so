import CampaignTabScene from "@/components/campaign/campaignTabScene";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requestAssets, requestCampaignList } from "@/providers/graphqlClient";
import { formatCampaign } from "@/utils/format/formatCampaign";

export const revalidate = 3600;

export default async function AdvancedModeHomepage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawCampaigns = await requestCampaignList({
    pageSize: 32,
    orderBy: "trending",
  });
  const initialData = rawCampaigns.map((c) => formatCampaign(c));
  const cookieStore = await cookies();
  const mode = cookieStore.get("advanced-mode")?.value;
  const referral = (await searchParams)?.referral;
  if (!mode || mode === "false") {
    const assets = await requestAssets();
    // const hottestSlug = assets
    //   .sort((a, b) => b.totalSpent - a.totalSpent)[0]
    //   .name.toLowerCase();
    return redirect(
      `/simple/campaign/kag/5mins${referral ? `?referral=${referral}` : ""}`,
    );
  }

  return (
    <section>
      <CampaignTabScene initialData={initialData} />
    </section>
  );
}

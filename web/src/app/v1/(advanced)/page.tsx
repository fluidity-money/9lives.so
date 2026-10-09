import CampaignTabScene from "@/components/campaign/campaignTabScene";
import { requestCampaignList } from "@/providers/graphqlClient";
import { formatCampaign } from "@/utils/format/formatCampaign";
import config from "@/config";

export const revalidate = 3600;

export default async function AdvancedModeHomepage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let disableV1Markets = true;
  try {
    const response = await fetch(config.NEXT_PUBLIC_FEATURES_URL, {
      cache: "no-store",
    });
    if (response.ok) {
      const features = (await response.json()) as {
        "disable v1 markets"?: boolean;
      };
      disableV1Markets = features["disable v1 markets"] ?? disableV1Markets;
    }
  } catch {
    // Fall back to the checked-in feature defaults when the remote is unavailable.
  }

  if (disableV1Markets) return redirect("/");

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

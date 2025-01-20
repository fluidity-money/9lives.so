import DetailWrapper from "@/components/detail/detailWrapper";
import { requestCampaignById } from "@/providers/graphqlClient";
import { getCampaigns } from "@/serverData/getCampaigns";
import { Campaign } from "@/types";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamicParams = true;
export const revalidate = 60;
export async function generateStaticParams() {
  const campaigns = await getCampaigns();
  return campaigns.map((campaign) => ({
    id: campaign.identifier,
  }));
}
type Params = Promise<{ id: string }>;
export default async function DetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const campaign = (await requestCampaignById(id)) as Campaign;
  if (!campaign) notFound();
  Object.assign(campaign, {
    isYesNo:
      campaign.outcomes.length === 2 &&
      campaign.outcomes.findIndex((outcome) => outcome.name === "Yes") !== -1 &&
      campaign.outcomes.findIndex((outcome) => outcome.name === "No") !== -1,
  });
  return (
    <section className="flex h-full flex-col gap-8 md:flex-row md:gap-4">
      <Suspense>
        <DetailWrapper initialData={campaign} />
      </Suspense>
    </section>
  );
}

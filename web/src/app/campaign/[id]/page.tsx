import DetailWrapper from "@/components/detail/detailWrapper";
import { requestCampaignById } from "@/providers/graphqlClient";
import { getCampaignsForSSG } from "@/serverData/getCampaigns";
import { CampaignDetailDto } from "@/types";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamicParams = true;
export const revalidate = 60;
export async function generateStaticParams() {
  const campaigns = await getCampaignsForSSG();
  return campaigns.map((campaign) => ({
    id: campaign.identifier,
  }));
}
type Params = Promise<{ id: string }>;
export default async function DetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const response = await requestCampaignById(id);
  if (!response) notFound();
  const campaign = JSON.parse(JSON.stringify(new CampaignDetailDto(response)));
  return (
    <Suspense>
      <DetailWrapper initialData={campaign} />
    </Suspense>
  );
}

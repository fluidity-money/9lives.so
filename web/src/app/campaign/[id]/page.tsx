import DetailWrapper from "@/components/detail/detailWrapper";
import config from "@/config";
import { requestCampaignById } from "@/providers/graphqlClient";
import { getCampaignsForSSG } from "@/serverData/getCampaigns";
import { CampaignDetailDto } from "@/types";
import { notFound } from "next/navigation";
import { Suspense } from "react";
type Params = Promise<{ id: string }>;
export const dynamicParams = true;
export const revalidate = 60;
export async function generateStaticParams() {
  const campaigns = await getCampaignsForSSG();
  return campaigns.map((campaign) => ({
    id: campaign.identifier,
  }));
}
export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const response = await requestCampaignById(id);
  return {
    title: response?.name ?? "Predict on 9LIVES.so",
    description: response?.description,
    other: {
      "fc:frame": JSON.stringify(config.frame),
    },
  };
}
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

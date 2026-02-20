import DetailWrapper from "@/components/detail/detailWrapper";
import config from "@/config";
import {
  requestCampaignById,
  requestCampaignList,
  requestPriceChanges,
} from "@/providers/graphqlClient";
import { PriceEvent } from "@/types";
import { formatCampaignDetail } from "@/utils/format/formatCampaign";
import { notFound } from "next/navigation";
import { Suspense } from "react";
type Params = Promise<{ id: string }>;
export const dynamicParams = true;
export const revalidate = 300;
export async function generateStaticParams() {
  const campaigns = await requestCampaignList({ page: -1 });
  return campaigns.map((campaign) => ({
    id: campaign.identifier,
  }));
}
export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const response = await requestCampaignById(id);
  return {
    title: response?.name ?? "Predict on 9lives.so",
    description: response?.description,
    other: {
      "fc:miniapp": JSON.stringify({
        version: config.frame.version,
        imageUrl: `${config.metadata.metadataBase.origin}/v1/campaign/${id}/farcaster-image`,
        button: config.frame.button,
      }),
    },
  };
}
export default async function DetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const response = await requestCampaignById(id);
  if (!response) notFound();
  const campaign = formatCampaignDetail(response);
  let priceEvents: PriceEvent[] = [];
  if (!campaign.isDppm && !campaign.isDpm) {
    priceEvents = await requestPriceChanges(response.poolAddress);
  }

  return (
    <Suspense>
      <DetailWrapper initialData={campaign} priceEvents={priceEvents} />
    </Suspense>
  );
}

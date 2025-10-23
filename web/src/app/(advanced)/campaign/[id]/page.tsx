import DetailWrapper from "@/components/detail/detailWrapper";
import config from "@/config";
import {
  requestAssetPrice,
  requestCampaignById,
  requestPriceChanges,
} from "@/providers/graphqlClient";
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
      "fc:miniapp": JSON.stringify({
        version: config.frame.version,
        imageUrl: `${config.metadata.metadataBase.origin}/campaign/${id}/farcaster-image`,
        button: config.frame.button,
      }),
    },
  };
}
export default async function DetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const response = await requestCampaignById(id);
  if (!response) notFound();
  const campaign = JSON.parse(JSON.stringify(new CampaignDetailDto(response)));
  const priceEvents = await requestPriceChanges(response.poolAddress);
  const initialAssetPrices = await requestAssetPrice(
    response.priceMetadata!.baseAsset.toUpperCase(),
    new Date(response.starting).toISOString(),
  )?.then((res) => {
    if (res?.oracles_ninelives_prices_1) {
      return res?.oracles_ninelives_prices_1.map((i) => ({
        price: i.amount,
        id: i.id,
        timestamp:
          new Date(i.created_by).getTime() -
          new Date().getTimezoneOffset() * 60 * 1000,
      }));
    }
    return [];
  });
  return (
    <Suspense>
      <DetailWrapper
        initialData={campaign}
        priceEvents={priceEvents}
        initialAssetPrices={initialAssetPrices}
      />
    </Suspense>
  );
}

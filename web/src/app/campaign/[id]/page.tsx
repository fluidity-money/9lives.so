import DetailWrapper from "@/components/detail/detailWrapper";
import { getCampaigns } from "@/serverData/getCampaigns";
import { Suspense } from "react";
import appConfig from "@/config";

export const dynamicParams = true;
export const revalidate = appConfig.cacheRevalidation.detailPages;
export async function generateStaticParams() {
  const campaigns = await getCampaigns();
  return campaigns.map((campaign) => ({
    id: campaign.identifier,
  }));
}
export default async function DetailPage({
  params,
}: {
  params: { id: string };
}) {
  const campaigns = await getCampaigns();
  const campaign = campaigns.find(
    (campaign) => campaign.identifier === params.id,
  )!;
  return (
    <section className="flex h-full gap-4">
      <Suspense>
        <DetailWrapper initialData={campaign} />
      </Suspense>
    </section>
  );
}

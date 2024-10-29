import DetailWrapper from "@/components/detail/detailWrapper";
import appConfig from "@/config";
import { requestCampaignList } from "@/providers/graphqlClient";
import { Campaign } from "@/types";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";

export const dynamicParams = true;

const getCampaigns = unstable_cache(
  async () => {
    return (await requestCampaignList).campaigns as Campaign[];
  },
  ["campaigns"],
  { revalidate: appConfig.cacheRevalidation.detailPages, tags: ["campaigns"] },
);

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

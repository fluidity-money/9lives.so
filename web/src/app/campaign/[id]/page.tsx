import DetailCall2Action from "@/components/detail/detailAction";
import DetailHeader from "@/components/detail/detailHeader";
import DetailOutcomes from "@/components/detail/detailOutcomes";
import appConfig from "@/config";
import { requestCampaignList } from "@/providers/graphqlClient";
import { Campaign } from "@/types";
import { unstable_cache } from "next/cache";

export const dynamicParams = true;

export async function generateStaticParams() {
  const response = await requestCampaignList;
  const { campaigns } = response;

  return campaigns.map((campaign) => ({
    id: campaign.identifier,
  }));
}

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
      <div className="flex flex-[2] flex-col gap-8">
        <DetailHeader data={campaign} />
        <DetailOutcomes data={campaign.outcomes} />
      </div>
      <div className="flex-1">
        <DetailCall2Action
          initalData={campaign.outcomes}
          tradingAddr={campaign.poolAddress}
        />
      </div>
    </section>
  );
}

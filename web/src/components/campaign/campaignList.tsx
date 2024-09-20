import CampaignItem from "./campaignItem";
import { unstable_cache } from "next/cache";
import { requestCampaignList } from "@/providers/graphqlClient";
import appConfig from "@/config";

const getCampaigns = unstable_cache(
  async () => {
    return (await requestCampaignList).campaigns;
  },
  ["campaigns"],
  { revalidate: appConfig.cacheRevalidation.homePage, tags: ["campaigns"] },
);

export default async function CampaignList() {
  const data = await getCampaigns();

  if (!data || !data?.length) return <div>No item</div>;

  const mockData = [
    ...data,
    ...data.map((item) => ({
      ...item,
      outcomes: [item.outcomes[0]],
    })),
    ...data,
    ...data,
    ...data,
    ...data,
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {mockData.map((campaign) => (
        <CampaignItem key={campaign.identifier} data={campaign} />
      ))}
    </div>
  );
}

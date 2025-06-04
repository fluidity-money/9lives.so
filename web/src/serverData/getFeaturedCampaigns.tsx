import { requestFeaturedCampaigns } from "@/providers/graphqlClient";
import { Campaign, CampaignDto } from "@/types";
import { unstable_cache } from "next/cache";

async function getCampaigns() {
  const data = await requestFeaturedCampaigns();
  return data.map((i) =>
    JSON.parse(JSON.stringify(new CampaignDto(i))),
  ) as Campaign[];
}
export const getCachedFeaturedCampaigns = unstable_cache(
  getCampaigns,
  ["featuredCampaigns"],
  {
    revalidate: 3600,
    tags: ["featuredCampaigns"],
  },
);

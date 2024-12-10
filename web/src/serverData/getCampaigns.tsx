import { requestCampaignList } from "@/providers/graphqlClient";
import { unstable_cache } from "next/cache";
import { Campaign } from "@/types";

export async function getCampaigns() {
  const campaigns = (await requestCampaignList) as Campaign[];
  // const campaigns = res as Campaign[];
  return campaigns.map((campaign) => {
    campaign["isYesNo"] =
      campaign.outcomes.length === 2 &&
      campaign.outcomes.findIndex((outcome) => outcome.name === "Yes") !== -1 &&
      campaign.outcomes.findIndex((outcome) => outcome.name === "No") !== -1;
    return campaign;
  });
}

export const getCachedCampaigns = unstable_cache(getCampaigns, ["campaigns"], {
  revalidate: 60,
  tags: ["campaigns"],
});

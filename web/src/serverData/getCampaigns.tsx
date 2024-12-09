import { requestCampaignList } from "@/providers/graphqlClient";
import { Campaign } from "@/types";
import { unstable_cache } from "next/cache";
import appConfig from "@/config";

export async function getCampaigns() {
  const campaigns = (await requestCampaignList).campaigns as Campaign[];
  return campaigns.map((campaign) => {
    campaign["isYesNo"] =
      campaign.outcomes.length === 2 &&
      campaign.outcomes.findIndex((outcome) => outcome.name === "Yes") !== -1 &&
      campaign.outcomes.findIndex((outcome) => outcome.name === "No") !== -1;
    return campaign;
  });
}

export const getCachedCampaigns = unstable_cache(getCampaigns, ["campaigns"], {
  revalidate: appConfig.cacheRevalidation.homePage,
  tags: ["campaigns"],
});

// import { requestCampaignList } from "@/providers/graphqlClient";
import { unstable_cache } from "next/cache";
import { Campaign } from "@/types";
import appConfig from "@/config";
const query = `
    query Campaigns {
      campaigns(pageSize: 32) {
        name
        identifier
        description
        picture
        settlement
        oracleDescription
        oracleUrls
        poolAddress
        creator {
          address
        }
        outcomes {
          identifier
          name
          picture
          share {
            address
          }
        }
        ending
        starting
        winner
        totalVolume
      }
    }
  `;
const queryForSSG = `
  query Campaigns {
    campaigns(page: -1) {
    identifier
    }
  }
  `;
export async function getCampaignsForSSG() {
  const res = await fetch(appConfig.NEXT_PUBLIC_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: queryForSSG }),
  });
  const result = await res.json();
  const campaigns = result.data.campaigns as { identifier: string }[];
  return campaigns;
}
export async function getCampaigns() {
  const res = await fetch(appConfig.NEXT_PUBLIC_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const result = await res.json();
  const campaigns = result.data.campaigns as Campaign[];
  return campaigns.map((campaign) => {
    campaign["isYesNo"] =
      campaign.outcomes.length === 2 &&
      campaign.outcomes.findIndex((outcome) => outcome.name === "Yes") !== -1 &&
      campaign.outcomes.findIndex((outcome) => outcome.name === "No") !== -1;
    return campaign;
  });
}
export const getCachedCampaigns = unstable_cache(
  getCampaigns,
  ["campaigns", "volume"],
  {
    revalidate: 3600,
    tags: ["campaigns"],
  },
);

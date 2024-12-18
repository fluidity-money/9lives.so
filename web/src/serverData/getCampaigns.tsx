// import { requestCampaignList } from "@/providers/graphqlClient";
import { unstable_cache } from "next/cache";
import { Campaign } from "@/types";
import appConfig from "@/config";
const query = `
    query Campaigns {
      campaigns {
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
          description
          picture
          share {
            address
          }
        }
        ending
        starting
      }
    }
  `;

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

export const getCachedCampaigns = unstable_cache(getCampaigns, ["campaigns"], {
  revalidate: 3600,
  tags: ["campaigns"],
});

// import { requestCampaignList } from "@/providers/graphqlClient";
import { unstable_cache } from "next/cache";
import { Campaign, CampaignDto } from "@/types";
import appConfig from "@/config";
const query = `
    query Campaigns {
      campaigns(pageSize: 32,orderBy:"trending") {
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
        shares {
          identifier
          shares
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
  const campaigns = result.data.campaigns.map((c: any) =>
    JSON.parse(JSON.stringify(new CampaignDto(c))),
  );
  return campaigns as Campaign[];
}
export const getCachedCampaigns = unstable_cache(
  getCampaigns,
  ["campaigns", "trending"],
  {
    revalidate: 3600,
    tags: ["campaigns"],
  },
);

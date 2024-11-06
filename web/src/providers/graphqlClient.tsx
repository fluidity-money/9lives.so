import { graphql } from "@/gql";
import { GraphQLClient } from "graphql-request";
import appConfig from "@/config";

const CampaignList = graphql(`
  query CampaignList {
    campaigns {
      name
      identifier
      description
      oracle
      poolAddress
      creator {
        address
      }
      outcomes {
        identifier
        name
        description
        share {
          address
        }
      }
      ending
    }
  }
`);

const getAchievements = graphql(`
  query getAchievements($wallet: String) {
    achievements(wallet: $wallet) {
      id
      name
      count
      description
      shouldCountMatter
      product
    }
  }
`);

const getLeaderboard = graphql(`
  query getLeaderboard($season: Int) {
    leaderboards(product: "9lives", season: $season) {
      id
      items {
        id
        wallet
        ranking
        scoring
      }
    }
  }
`);

const getTotalUserCount = graphql(`
  query getTotalUserCount {
    productUserCount(product: "9lives")
  }
`);

const graph9Lives = new GraphQLClient(appConfig.NEXT_PUBLIC_GRAPHQL_URL);
const graphPoints = new GraphQLClient(appConfig.NEXT_PUBLIC_POINTS_URL);

export const requestCampaignList = graph9Lives.request(CampaignList);
export const requestAchievments = (wallet?: string) =>
  graphPoints.request(getAchievements, { wallet });
export const requestLeaderboard = (season?: number) =>
  graphPoints.request(getLeaderboard, { season });
export const requestTotalUserCount = graphPoints.request(getTotalUserCount);

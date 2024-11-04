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
      outcomes {
        identifier
        name
        description
        share {
          address
        }
      }
    }
  }
`);

const getAchievements = graphql(`
  query getAchievements($wallet: String!) {
    achievements(wallet: $wallet) {
      id
      name
      count
      description
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

const graph9Lives = new GraphQLClient(appConfig.NEXT_PUBLIC_GRAPHQL_URL);
const graphPoints = new GraphQLClient(appConfig.NEXT_PUBLIC_POINTS_URL);

export const requestCampaignList = graph9Lives.request(CampaignList);
export const requestAchievments = (wallet: string) =>
  graphPoints.request(getAchievements, { wallet });
export const requestLeaderboard = (season?: number) =>
  graphPoints.request(getLeaderboard, { season });

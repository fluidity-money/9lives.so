import { graphql } from "@/gql";
import request, { GraphQLClient } from "graphql-request";
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
        share {
          address
        }
      }
    }
  }
`);

const graphqlClient = new GraphQLClient(appConfig.NEXT_PUBLIC_GRAPHQL_URL);

export const requestCampaignList = graphqlClient.request(CampaignList);

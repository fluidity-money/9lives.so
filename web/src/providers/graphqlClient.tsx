import appConfig from "@/config";
import { Lives9 } from "@/graffle/lives9/__";
import { Graffle } from "graffle";
import { Points } from "@/graffle/points/__";
import { CampaignFilters, OutcomeInput } from "@/types";

const graph9Lives = Lives9.create().transport({
  url: appConfig.NEXT_PUBLIC_GRAPHQL_URL,
});
const graph9LivesSubs = Graffle.create().transport({
  url: appConfig.NEXT_PUBLIC_WS_URL.replace("wss", "https"),
});
const graphPoints = Points.create().transport({
  url: appConfig.NEXT_PUBLIC_POINTS_URL,
});
export const requestCampaignList = (filterParams: CampaignFilters) =>
  graph9Lives.query.campaigns({
    $: { ...filterParams },
    name: true,
    identifier: true,
    description: true,
    picture: true,
    oracleDescription: true,
    oracleUrls: true,
    settlement: true,
    poolAddress: true,
    creator: {
      address: true,
    },
    outcomes: {
      identifier: true,
      name: true,
      picture: true,
      share: {
        address: true,
      },
    },
    ending: true,
    starting: true,
    winner: true,
    totalVolume: true,
  });
export const requestAchievments = (wallet?: string) =>
  graphPoints.query.achievements({
    $: { wallet },
    id: true,
    name: true,
    count: true,
    description: true,
    shouldCountMatter: true,
    product: true,
  });
export const requestAchievmentCount = (wallet: string) =>
  graphPoints.query.achievements({
    $: { wallet },
    id: true,
  });
export const requestLeaderboard = (season?: number) =>
  graphPoints.query.leaderboards({
    $: { product: "9lives", season },
    items: {
      wallet: true,
      ranking: true,
      scoring: true,
    },
  });
export const requestTotalUserCount = graphPoints.query.productUserCount({
  $: { product: "9lives" },
});
export const requestCreateCampaign = (params: {
  name: string;
  desc: string;
  picture?: string;
  outcomes: OutcomeInput[];
  oracleDescription?: string;
  oracleUrls?: string[];
  seed: number;
  creator: string;
  ending: number;
  starting: number;
  x?: string;
  telegram?: string;
  web?: string;
  isFake: boolean;
}) =>
  graph9Lives.mutation.explainCampaign({
    $: {
      $type: "PUT",
      name: params.name,
      description: params.desc,
      picture: params.picture,
      outcomes: params.outcomes,
      seed: params.seed,
      creator: params.creator,
      oracleUrls: params.oracleUrls,
      ending: params.ending,
      starting: params.starting,
      oracleDescription: params.oracleDescription,
      x: params.x,
      telegram: params.telegram,
      web: params.web,
      isFake: params.isFake,
    },
  });
export const requestGetAITitles = graph9Lives.query.suggestedHeadlines();

export const requestBuysAndSells = (limit?: number) =>
  graph9LivesSubs
    .gql(
      `
    query {
      ninelives_buys_and_sells_1(limit:  ${limit ?? 10}, order_by: {created_by: desc}, where: {campaign_content: {_is_null: false}, shown: {_eq: true}}) {
        to_amount
        to_symbol
        transaction_hash
        recipient
        spender
        block_hash
        block_number
        outcome_id
        campaign_id
        created_by
        emitter_addr
        from_amount
        from_symbol
        type
        total_volume
        campaign_content
      }
    }
  `,
    )
    .send();

export const requestCreations = (limit?: number) =>
  graph9LivesSubs
    .gql(
      `
    query {
      ninelives_campaigns_1(limit: ${limit ?? 10}, order_by: {created_at: desc}) {
       id
       created_at
       content
       updated_at
      }
    }
    `,
    )
    .send();

export const requestCampaignById = (id: string) =>
  graph9Lives.query.campaignById({
    $: { id },
    name: true,
    identifier: true,
    description: true,
    picture: true,
    oracleDescription: true,
    oracleUrls: true,
    settlement: true,
    poolAddress: true,
    creator: {
      address: true,
    },
    outcomes: {
      identifier: true,
      name: true,
      picture: true,
      share: {
        address: true,
      },
    },
    ending: true,
    starting: true,
    winner: true,
    totalVolume: true,
    investmentAmounts: {
      id: true,
      share: true,
      usdc: true,
    },
  });

export const requestUserParticipated = (address: string) =>
  graph9Lives.query.userParticipatedCampaigns({
    $: { address },
    campaignId: true,
    outcomeIds: true,
    content: {
      name: true,
      picture: true,
      poolAddress: true,
      outcomes: {
        name: true,
        identifier: true,
        picture: true,
        share: {
          address: true,
        },
      },
    },
  });

export const requestTotalVolume = (address: string) =>
  graph9Lives.query.userTotalVolume({
    $: { address },
  });

export const requestUserActivities = ({
  address,
  campaignId,
  page,
  pageSize,
}: {
  address: string;
  campaignId?: string;
  page?: number;
  pageSize?: number;
}) =>
  graph9Lives.query.userActivity({
    $: { address, campaignId, page, pageSize },
    campaignId: true,
    campaignName: true,
    outcomeId: true,
    outcomeName: true,
    outcomePic: true,
    type: true,
    fromSymbol: true,
    fromAmount: true,
    createdAt: true,
    toAmount: true,
    toSymbol: true,
    poolAddress: true,
    txHash: true,
  });

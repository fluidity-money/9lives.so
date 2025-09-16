import appConfig from "@/config";
import { Lives9 } from "@/graffle/lives9/__";
import { Graffle } from "graffle";
import { Points } from "@/graffle/points/__";
import { CampaignFilters, OutcomeInput } from "@/types";
import { MaxUint256 } from "ethers";

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
    shares: {
      identifier: true,
      shares: true,
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
    isDpm: true,
    creator: {
      address: true,
    },
    shares: {
      identifier: true,
      shares: true,
    },
    outcomes: {
      identifier: true,
      name: true,
      picture: true,
      share: {
        address: true,
      },
    },
    liquidityVested: true,
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
      isDpm: true,
      name: true,
      picture: true,
      poolAddress: true,
      winner: true,
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

export const requestPositionHistory = (address: string, outcomeIds: string[]) =>
  graph9Lives.query.positionsHistory({
    $: { outcomeIds, address },
    fromAmount: true,
    toAmount: true,
    outcomeId: true,
    txHash: true,
    type: true,
  });

export const requestUserClaims = (address: string, campaignId?: string) =>
  graph9Lives.query.userClaims({
    $: { address, campaignId },
    fusdcReceived: true,
    sharesSpent: true,
    winner: true,
    createdAt: true,
    content: {
      identifier: true,
      name: true,
      picture: true,
      outcomes: {
        identifier: true,
        name: true,
        picture: true,
      },
    },
  });

export const requestProfile = (address: string) =>
  graph9Lives.query.userProfile({
    $: { address },
    email: true,
    settings: {
      refererr: true,
    },
  });

export const synchProfile = (address: string, email: string) =>
  graph9Lives.mutation.synchProfile({
    $: { walletAddress: address, email },
  });

export const storeCommitment = ({
  tradingAddr,
  seed,
  sender,
  preferredOutcome,
}: {
  tradingAddr: string;
  seed: string;
  sender: string;
  preferredOutcome: string;
}) =>
  graph9Lives.mutation.revealCommitment({
    $: { tradingAddr, seed, sender, preferredOutcome },
  });

export const requestUserLiquidity = ({
  address,
  tradingAddr,
}: {
  address: string;
  tradingAddr?: string;
}) =>
  graph9Lives.query.userLiquidity({
    $: { address, tradingAddr },
  });

export const requestLeaderboardCategories = () =>
  graph9Lives.query.leaderboards({
    referrers: {
      address: true,
      volume: true,
    },
    creators: {
      address: true,
      volume: true,
    },
    volume: {
      address: true,
      volume: true,
    },
  });

export const requestReferrersForAddress = (address: string) =>
  graph9Lives.query.referrersForAddress({
    $: { address },
  });

export const genReferrer = ({
  address,
  code,
}: {
  address: string;
  code: string;
}) =>
  graph9Lives.mutation.genReferrer({
    $: { walletAddress: address, code },
  });

export const associateReferral = ({
  sender,
  code,
  s,
  v,
  rr,
}: {
  sender: string;
  code: string;
  s: string;
  v: string;
  rr: string;
}) =>
  graph9Lives.mutation.associateReferral({
    $: {
      sender,
      code,
      s,
      v,
      rr,
    },
  });

export const requestSenderByCode = (code: string) =>
  graph9Lives.query.referrerByCode({
    $: { code },
  });

export const requestChangelog = () =>
  graph9Lives.query.changelog({
    afterTs: true,
    html: true,
  });

export const requestFeaturedCampaigns = (
  props: { limit: number } = {
    limit: 32,
  },
) =>
  graph9Lives.query.featuredCampaign({
    $: { limit: props.limit },
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
    shares: {
      identifier: true,
      shares: true,
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

export const requestUserLPs = (address: string) =>
  graph9Lives.query.userLPs({
    $: { address },
    liquidity: true,
    campaign: {
      identifier: true,
      name: true,
      picture: true,
      poolAddress: true,
      winner: true,
    },
  });

export const requestPaymaster = ({
  opType,
  amountToSpend,
  tradingAddr,
  nonce,
  minimumBack,
  deadline,
  originatingChainId,
  outgoingChainEid,
  outcome,
  owner,
  permitR,
  permitS,
  permitV,
  r,
  s,
  v,
  referrer,
}: {
  opType: Lives9.SelectionSets.PaymasterOperation;
  amountToSpend: string;
  tradingAddr: string;
  nonce: string;
  minimumBack: string;
  deadline: number;
  originatingChainId: string;
  outcome?: string;
  owner: string;
  permitR: string;
  permitS: string;
  permitV: number;
  outgoingChainEid: number;
  r: string;
  s: string;
  v: number;
  referrer?: string;
}) =>
  graph9Lives.mutation.requestPaymaster({
    $: {
      $type: "PUT",
      $operation: opType,
      amountToSpend,
      deadline,
      market: tradingAddr,
      maximumFee: "0",
      minimumBack,
      nonce,
      originatingChainId,
      outgoingChainEid,
      outcome,
      owner,
      permitR,
      permitS,
      permitV,
      permitAmount: MaxUint256.toString(),
      referrer,
      rr: r,
      s,
      v,
    },
  });

export const requestCountReferees = (referrerAddress: string) =>
  graph9Lives.query.countReferees({
    $: { referrerAddress },
  });

export const requestPnLOfWonCampaigns = (address: string) =>
  graph9Lives.query.userWonCampaignsProfits({
    $: { address },
    poolAddress: true,
    profit: true,
    winner: true,
  });

export const requestComments = ({
  campaignId,
  page,
  pageSize,
}: {
  campaignId: string;
  page?: number;
  pageSize?: number;
}) =>
  graph9Lives.query.campaignComments({
    $: { campaignId, page, pageSize },
    id: true,
    content: true,
    walletAddress: true,
    createdAt: true,
  });

export const postComment = ({
  campaignId,
  walletAddress,
  content,
}: {
  campaignId: string;
  walletAddress: string;
  content: string;
}) =>
  graph9Lives.mutation.postComment({
    $: { campaignId, walletAddress, content },
  });

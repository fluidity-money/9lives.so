import appConfig from "@/config";
import { Lives9 } from "@/graffle/lives9/__";
import { Graffle } from "graffle";
import { Points } from "@/graffle/points/__";
import { Accounts } from "@/graffle/accounts/__";
import { CampaignFilters, OutcomeInput, RawPricePoint } from "@/types";
import config from "@/config";
import { maxUint256 } from "viem";

const graph9Lives = Lives9.create().transport({
  url: appConfig.NEXT_PUBLIC_GRAPHQL_URL,
});
const graph9LivesSubs = Graffle.create().transport({
  url: appConfig.NEXT_PUBLIC_WS_URL.replace("wss", "https"),
});
const graphPoints = Points.create().transport({
  url: appConfig.NEXT_PUBLIC_POINTS_URL,
});
const graphAccounts = Accounts.create().transport({
  url: appConfig.NEXT_PUBLIC_ACCOUNTS_URL,
});
const graphAccountsWithStatus = Accounts.create({
  output: {
    envelope: {
      errors: {
        execution: true,
        other: true,
      },
    },
  },
}).transport({
  url: appConfig.NEXT_PUBLIC_ACCOUNTS_URL,
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
    isDppm: true,
    priceMetadata: {
      baseAsset: true,
      priceTargetForUp: true,
    },
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
      isDppm: false,
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
    categories: true,
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
    isDppm: true,
    priceMetadata: {
      baseAsset: true,
      priceTargetForUp: true,
    },
  });

export const requestUserParticipated = (
  address: string,
  page: number = 0,
  pageSize: number,
) =>
  graph9Lives.query.userParticipatedCampaigns({
    $: { address, page, pageSize },
    campaignId: true,
    content: {
      isDpm: true,
      isDppm: true,
      identifier: true,
      starting: true,
      ending: true,
      totalVolume: true,
      priceMetadata: {
        baseAsset: true,
        priceTargetForUp: true,
      },
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
    campaignContent: {
      isDppm: true,
      ending: true,
      priceMetadata: {
        baseAsset: true,
        priceTargetForUp: true,
      },
    },
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

export const requestUserClaims = ({
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
  graph9Lives.query.userClaims({
    $: { address, campaignId, page, pageSize },
    fusdcReceived: true,
    sharesSpent: true,
    winner: true,
    txHash: true,
    createdAt: true,
    pnl: true,
    content: {
      identifier: true,
      isDppm: true,
      priceMetadata: {
        baseAsset: true,
        priceTargetForUp: true,
      },
      starting: true,
      ending: true,
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
  v: number;
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
    isDppm: true,
    priceMetadata: {
      baseAsset: true,
      priceTargetForUp: true,
    },
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
      ending: true,
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
      permitAmount: maxUint256.toString(),
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

export const requestComments = ({
  campaignId,
  onlyHolders = false,
  page,
  pageSize,
}: {
  campaignId: string;
  onlyHolders?: boolean;
  page?: number;
  pageSize?: number;
}) =>
  graph9Lives.query.campaignComments({
    $: { campaignId, page, pageSize, onlyHolders },
    id: true,
    content: true,
    walletAddress: true,
    createdAt: true,
    investments: {
      id: true,
      amount: true,
    },
  });

export const postComment = ({
  campaignId,
  walletAddress,
  content,
  rr,
  s,
  v,
}: {
  campaignId: string;
  walletAddress: string;
  content: string;
  rr: string;
  s: string;
  v: number;
}) =>
  graph9Lives.mutation.postComment({
    $: { campaignId, walletAddress, content, rr, s, v },
  });

export const deleteComment = ({
  campaignId,
  id,
  walletAddress,
  content,
  rr,
  s,
  v,
}: {
  campaignId: string;
  id: number;
  walletAddress: string;
  content: string;
  rr: string;
  s: string;
  v: number;
}) =>
  graph9Lives.mutation.deleteComment({
    $: { id, campaignId, walletAddress, content, rr, s, v },
  });

export const requestPriceChanges = (poolAddress: string) =>
  graph9Lives.query.campaignPriceEvents({
    $: { poolAddress },
    createdAt: true,
    shares: { shares: true, identifier: true },
  });

export const requestWeeklyVolume = (poolAddress: string) =>
  graph9Lives.query.campaignWeeklyVolume({ $: { poolAddress } });

export const requestSimpleMarket = (symbol: string, period: string) =>
  graph9Lives.query.campaignBySymbol({
    $: {
      symbol: symbol.toUpperCase(),
      category: period[0].toUpperCase() + period.slice(1).toLowerCase(),
    },
    categories: true,
    identifier: true,
    starting: true,
    ending: true,
    poolAddress: true,
    outcomes: {
      identifier: true,
      name: true,
      picture: true,
      share: { address: true },
    },
    totalVolume: true,
    creator: { address: true },
    winner: true,
    investmentAmounts: { usdc: true, share: true, id: true },
    priceMetadata: {
      baseAsset: true,
      priceTargetForUp: true,
    },
    name: true,
  });

export const requestAssetPrices = (
  symbol: string,
  starting: string,
  ending: string,
  page: number = 0,
  pageSize: number = config.hasuraMaxQueryItem,
) =>
  graph9LivesSubs
    .gql(
      `
query {
  oracles_ninelives_prices_2(limit: ${pageSize}, offset: ${page * pageSize}, order_by: {created_by: asc}, where: {created_by: {_gte: "${starting}", _lte: "${ending}"} base: {_eq: "${symbol.toUpperCase()}"}}) {
    id
    amount
    created_by
  }
}
`,
    )
    .send() as Promise<{
    oracles_ninelives_prices_2: RawPricePoint[];
  }> | null;

export const requestFinalPrice = (
  symbol: string,
  starting: string,
  ending: string,
) =>
  graph9LivesSubs
    .gql(
      `
query {
  oracles_ninelives_prices_2(order_by: {created_by: desc}, limit:1, where: {created_by: {_gte: "${starting}", _lte: "${ending}"} base: {_eq: "${symbol.toUpperCase()}"}}) {
    id
    amount
    created_by
  }
}
`,
    )
    .send() as Promise<{
    oracles_ninelives_prices_2: RawPricePoint[];
  }> | null;

export const requestTimebasedCampaigns = (
  categories: string[],
  tokens: string[],
) =>
  graph9Lives.query.timebasedCampaigns({
    $: { categories, tokens },
    name: true,
    identifier: true,
    description: true,
    picture: true,
    oracleDescription: true,
    oracleUrls: true,
    settlement: true,
    poolAddress: true,
    isDppm: true,
    priceMetadata: {
      baseAsset: true,
      priceTargetForUp: true,
    },
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

export const requestUnclaimedCampaigns = (address: string, token?: string) =>
  graph9Lives.query.unclaimedCampaigns({
    $: { address, token },
    totalSpent: true,
    campaign: {
      identifier: true,
      priceMetadata: {
        baseAsset: true,
        priceTargetForUp: true,
      },
      starting: true,
      poolAddress: true,
      ending: true,
      outcomes: {
        name: true,
        picture: true,
        identifier: true,
        share: {
          address: true,
        },
      },
    },
  });

export const request9LivesPoints = (address?: string) =>
  graphPoints.query.ninelivesPoints({
    $: { wallet: address },
    amount: true,
    wallet: true,
    rank: true,
  });

export const createAccount = ({
  eoaAddr,
  r,
  s,
  v,
  authority,
}: {
  eoaAddr: string;
  r: string;
  s: string;
  v: number;
  authority: string;
}) =>
  graphAccounts.mutation.createAccountExec({
    $: {
      createAccount: {
        eoa_addr: eoaAddr,
        sigR: r,
        sigS: s,
        sigV: v,
        authority,
      },
    },
    secret: true,
    hash: true,
  });
export const requestSecret = ({
  eoaAddr,
  nonce,
  r,
  s,
  v,
}: {
  eoaAddr: string;
  nonce: number;
  r: string;
  s: string;
  v: number;
}) =>
  graphAccounts.mutation.requestSecret({
    $: {
      eoa_addr: eoaAddr,
      nonce,
      sigR: r,
      sigS: s,
      sigV: v,
    },
  });
export const hasCreated = (address: string) =>
  graphAccounts.query.hasCreated({ $: { address } });
export const requestPublicKey = () => graphAccounts.query.publickey();
export const requestEoaForAddress = (address: string) =>
  graphAccounts.query.eoaForAddress({
    $: {
      address,
    },
  });
export const ninelivesMint = ({
  amount,
  outcome,
  poolAddress,
  referrer,
  permit,
  secret,
  eoaAddress,
}: {
  amount: string;
  outcome: string;
  poolAddress: string;
  referrer: string;
  secret: string;
  eoaAddress: string;
  permit?: {
    permitR: string;
    permitS: string;
    permitV: number;
    deadline: number;
  };
}) =>
  graphAccountsWithStatus
    .transport({
      headers: { Authorization: `${eoaAddress}:${secret}` },
    })
    .mutation.ninelivesMint({
      $: {
        mint: {
          amount,
          market: poolAddress,
          referrer,
          ms_ts: Date.now().toString(),
          outcome,
          permit,
        },
      },
    });

export const requestAssets = async () =>
  graph9Lives.query.assets({
    totalSpent: true,
    name: true,
  });

export const ninelivesClaimAll = async ({
  eoaAddress,
  secret,
  markets,
}: {
  eoaAddress: string;
  secret: string;
  markets: string[];
}) =>
  graphAccountsWithStatus
    .transport({
      headers: { Authorization: `${eoaAddress}:${secret}` },
    })
    .mutation.claimRewards({ $: { msTs: Date.now().toString(), markets } });

export const requestTotalPnL = async (address: string) =>
  graph9Lives.query.totalPnL({ $: { address }, totalPnl: true, volume: true });

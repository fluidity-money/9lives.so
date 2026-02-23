import {
  requestCampaignList,
  requestAchievments,
  requestCampaignById,
  requestUserClaims,
  requestPaymaster,
  requestComments,
  requestPriceChanges,
  requestSimpleMarket,
  requestUserParticipated,
  requestUnclaimedCampaigns,
  request9LivesPoints,
  requestAssets,
  requestPositionHistory,
} from "./providers/graphqlClient";
import config from "./config";
import { requestUserActivities } from "./providers/graphqlClient";
import { formatParticipatedContent } from "./utils/format/formatCampaign";
import { type Chain as ViemChain } from "viem";
import { StaticImageData } from "next/image";
export type RawCampaign = Awaited<
  ReturnType<typeof requestCampaignList>
>[number];
export type RawCampaignDetail = Awaited<ReturnType<typeof requestCampaignById>>;
export type RawOutcome = NonNullable<RawCampaignDetail>["outcomes"][number];
export type RawSimpleCampaignDetail = Awaited<
  ReturnType<typeof requestSimpleMarket>
>;
export interface CampaignFilters {
  category?: typeof config.categories;
  orderBy?: "newest" | "volume" | "ending" | "ended" | "liquidity" | "trending";
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  address?: string;
}
export type Campaign = Omit<
  RawCampaign,
  "outcomes" | "identifier" | "poolAddress" | "priceMetadata"
> & {
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  isYesNo: boolean;
  outcomes: Outcome[];
  priceMetadata: {
    baseAsset: SimpleMarketKey;
    priceTargetForUp: string;
  } | null;
};
export type SimpleCampaignDetail = NonNullable<RawSimpleCampaignDetail> & {
  outcomes: Outcome[];
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  isDpm: false;
  isDppm: true;
  priceMetadata: {
    baseAsset: SimpleMarketKey;
    priceTargetForUp: string;
  };
};
export type CampaignDetail = Omit<
  NonNullable<RawCampaignDetail>,
  "outcomes" | "identifier" | "poolAddress" | "priceMetadata"
> & {
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  isYesNo: boolean;
  outcomes: Outcome[];
  priceMetadata: {
    baseAsset: SimpleMarketKey;
    priceTargetForUp: string;
  } | null;
};
export type Outcome = {
  name: string;
  picture: string | null;
  identifier: `0x${string}`;
  share: { address: `0x${string}` };
};
export type SelectedOutcome = { id: string; state: "buy" | "sell" };
export type RawLeader = Awaited<ReturnType<typeof request9LivesPoints>>[number];
export type Leader = NonNullable<RawLeader>;
export type Achievement = Awaited<
  ReturnType<typeof requestAchievments>
>[number] & { isOwned: boolean };
export type Detail = {
  totalInvestment: bigint;
  totalShares: bigint;
  winner: `0x${string}` | undefined;
  outcomes: {
    id: `0x${string}`;
    share: bigint;
    invested: bigint;
    isWinner: boolean;
  }[];
};
export type OutcomeType = "custom" | "default";
export type SettlementType = "ORACLE" | "POLL" | "AI" | "CONTRACT";
export type CampaignInput = {
  name: string;
  desc: string | "";
  picture?: string;
  starting: string;
  ending: string;
  outcomes: OutcomeInput[];
  seed: number;
  x?: string;
  telegram?: string;
  web?: string;
  outcomeType?: OutcomeType;
  settlementType: SettlementType;
  oracleDescription?: string;
  seedLiquidity: number;
  fromChain: number;
  fromToken: string;
  fromDecimals?: number;
  toChain: number;
  toToken: string;
};
export type OutcomeInput = {
  picture?: string;
  name: string;
  seed: number;
};
export type Action = {
  id: string;
  campaignName: string;
  campaignId: string;
  type: "create" | "buy" | "sell";
  campaignPic: string | null;
  timestamp: string;
  campaignVol?: string;
  actionValue?: string;
  outcomeName?: string;
};
export enum InfraMarketState {
  Callable,
  Closable,
  Whinging,
  Predicting,
  Revealing,
  Declarable,
  Sweeping,
  Closed,
  Loading,
}
export type BuyAndSellResponse = {
  ninelives_buys_and_sells_1: {
    to_amount: number;
    to_symbol: string;
    transaction_hash: `0x${string}`;
    recipient: `0x${string}`;
    spender: `0x${string}`;
    block_hash: string;
    block_number: number;
    outcome_id: `0x${string}`;
    campaign_id: `0x${string}`;
    created_by: string;
    emitter_addr: `0x${string}`;
    from_amount: number;
    from_symbol: string;
    type: "buy" | "sell";
    total_volume: number;
    campaign_content: Campaign;
  }[];
};
export type CreationResponse = {
  ninelives_campaigns_1: {
    id: string;
    created_at: string;
    content: Campaign;
    updated_at: string;
  }[];
};

export type RawParticipatedCampaign = Awaited<
  ReturnType<typeof requestUserParticipated>
>[number];
export type ParticipatedCampaign = RawParticipatedCampaign & {
  campaignId: `0x${string}`;
  content: ReturnType<typeof formatParticipatedContent>;
};

export type RawActivity = Awaited<
  ReturnType<typeof requestUserActivities>
>[number];

export type Activity = NonNullable<RawActivity>;

export type Token = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  priceUSD: string;
  coinKey: string;
  logoURI: string;
};

export enum PaymasterType {
  MINT,
  BURN,
  ADD_LIQUIDITY,
  REMOVE_LIQUIDITY,
  WITHDRAW_USDC,
}

export type MintedPosition = {
  id: `0x${string}`;
  shareAddress: `0x${string}`;
  name: string;
  balance: string;
  balanceRaw: bigint;
};
export type PaymasterAttemptResponse = {
  ninelives_paymaster_attempts_2: PaymasterAttempt[];
};
export type PaymasterAttempt = {
  id: string;
  created_by: string;
  poll_id: number;
  transaction_hash: string;
  success: boolean;
};

type PaymasterParams = Parameters<typeof requestPaymaster>[0];
export type PaymasterOp = PaymasterParams["opType"];

export type Ticket = {
  id: string;
  amount: string;
  address: string;
  outcomeId?: string;
  data?: CampaignDetail | SimpleCampaignDetail;
  opType: PaymasterOp;
  dppmMetadata?: DppmMetadata;
  chainId?: number;
};

export type Comment = NonNullable<
  Awaited<ReturnType<typeof requestComments>>[number]
>;

export type PriceEvent = Awaited<
  ReturnType<typeof requestPriceChanges>
>[number];

export type RawPricePoint = {
  id: number;
  amount: number;
  created_by: string;
};
export type PricePoint = { id: number; price: number; timestamp: number };
export type PayoffResponse = {
  dppmFusdc: bigint;
  ninetailsLoserFusd: bigint;
  ninetailsWinnerFusdc: bigint;
};
export type Payoff = {
  dppmFusdc: number;
  ninetailsLoserFusd: number;
  ninetailsWinnerFusdc: number;
};

export type RawClaimedCampaign = Awaited<
  ReturnType<typeof requestUserClaims>
>[number];

export type ClaimedCampaign = NonNullable<
  Awaited<ReturnType<typeof requestUserClaims>>[number]
>;

export type DppmMetadata = {
  baseAsset: SimpleCampaignDetail["priceMetadata"]["baseAsset"];
  priceTargetForUp: number;
  priceOnBuy?: number;
  minuteOnBuy: number;
  volumeOnBuy: number;
};

export type RawUnclaimedCampaign = Awaited<
  ReturnType<typeof requestUnclaimedCampaigns>
>[number];

export type UnclaimedCampaign = Omit<
  SimpleCampaignDetail,
  | "isDpm"
  | "investmentAmounts"
  | "isDppm"
  | "winner"
  | "totalVolume"
  | "creator"
  | "categories"
  | "odds"
> & { totalSpent: number };

export type SimpleMarketKey = keyof typeof config.simpleMarkets;
export type SimpleMarketPeriod =
  (typeof config.simpleMarkets)[keyof typeof config.simpleMarkets]["periods"][number];

export type RawAsset = Awaited<ReturnType<typeof requestAssets>>[number];

export type Trade = {
  amount: string;
  txHash: string;
  outcomeId: `0x${string}`;
  createdAt: string;
};

export type Chain = ViemChain & { icon: StaticImageData };
type GroupButtonBaseProps = {
  callback?: () => void;
  textColor?: string;
};
export type GroupButtonProps = GroupButtonBaseProps &
  (
    | {
        title?: string;
        mobileTitle: string;
      }
    | {
        title: string;
        mobileTitle?: string;
      }
  );

export type PositionHistory = Awaited<
  ReturnType<typeof requestPositionHistory>
>[number];

export type Snapshot<TableName, Content> = {
  table: "";
  snapshot_toplevel?: {
    table: TableName;
    snapshot: Content[];
  }[];
  content: never;
};
export type PriceSnapshot = Snapshot<
  "oracles_ninelives_prices_2",
  RawPricePoint & { base: string }
>;
export type MessageBase<TableName, Content> = {
  table: TableName;
  content: Content;
};
export type PriceMessage = MessageBase<
  "oracles_ninelives_prices_2",
  RawPricePoint & { base: string }
>;
export type CampaignMessage = MessageBase<
  "ninelives_campaigns_1",
  {
    id: string;
    content: Omit<SimpleCampaignDetail, "identifier">;
  }
>;
export type TradeMessage = MessageBase<
  "ninelives_buys_and_sells_1",
  {
    from_amount: string;
    outcome_id: string;
    emitter_addr: string;
    campaign_id: string;
    transaction_hash: string;
    created_by: string;
  }
>;

export type WinnerMessage = MessageBase<
  "ninelives_events_outcome_decided",
  {
    created_by: string;
    transaction_hash: string;
    emitter_addr: string;
    identifier: string;
  }
>;

export type RewardMessage = MessageBase<
  "ninelives_payoff_unused_1",
  {
    created_at: string;
    pool_address: string;
    spender: string;
  }
>;

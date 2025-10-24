import {
  requestCampaignList,
  requestLeaderboard,
  requestAchievments,
  requestCampaignById,
  requestUserClaims,
  requestPaymaster,
  requestComments,
  requestPriceChanges,
  requestSimpleMarket,
} from "./providers/graphqlClient";
import config from "./config";
import { requestUserActivities } from "./providers/graphqlClient";
import formatFusdc from "./utils/formatFusdc";
import { Account } from "thirdweb/wallets";
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
  "outcomes" | "identifier" | "poolAddress"
> & {
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  isYesNo: boolean;
  outcomes: Outcome[];
};
export type SimpleCampaignDetail = NonNullable<RawSimpleCampaignDetail> & {
  outcomes: Outcome[];
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  priceMetadata: NonNullable<
    NonNullable<RawSimpleCampaignDetail>["priceMetadata"]
  >;
};
export type CampaignDetail = Omit<
  NonNullable<RawCampaignDetail>,
  "outcomes" | "identifier" | "poolAddress"
> & {
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  isYesNo: boolean;
  outcomes: Outcome[];
};
export type Outcome = {
  name: string;
  picture: string | null;
  identifier: `0x${string}`;
  share: { address: `0x${string}` };
};
export type SelectedOutcome = { id: string; state: "buy" | "sell" };
export type Leader = Awaited<
  ReturnType<typeof requestLeaderboard>
>[number]["items"][number];
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

export type PositionsProps = {
  campaignName: string;
  campaignId: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  winner?: string;
  isDpm: boolean | null;
};

export type Activity = NonNullable<
  Awaited<ReturnType<typeof requestUserActivities>>[number]
>;

export type ClaimedRewards = NonNullable<
  Awaited<ReturnType<typeof requestUserClaims>>[number]
>;

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
  account: Account;
  outcomeId?: string;
  data?: CampaignDetail | SimpleCampaignDetail;
  opType: PaymasterOp;
};

export type Comment = NonNullable<
  Awaited<ReturnType<typeof requestComments>>[number]
>;

export type PriceEvent = Awaited<
  ReturnType<typeof requestPriceChanges>
>[number];

export type PricePointResponse = {
  id: number;
  amount: number;
  created_by: string;
};
export type PricePoint = { id: number; price: number; timestamp: number };

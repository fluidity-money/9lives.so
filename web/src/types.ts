import {
  requestCampaignList,
  requestLeaderboard,
  requestAchievments,
  requestCampaignById,
  requestUserClaims,
} from "./providers/graphqlClient";
import config from "./config";
import { requestUserActivities } from "./providers/graphqlClient";
import formatFusdc from "./utils/formatFusdc";
import { Account } from "thirdweb/wallets";

export interface CampaignFilters {
  category?: typeof config.categories;
  orderBy?: "newest" | "volume" | "ending" | "ended";
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  address?: string;
}
export type Campaign = Omit<
  Awaited<ReturnType<typeof requestCampaignList>>[number],
  "outcomes"
> & {
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  isYesNo: boolean;
  outcomes: Outcome[];
};
export type CampaignDetail = Campaign & {
  investmentAmounts: { id: string; usdc: number; share: number }[];
  liquidityVested: number;
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
export class ActionFromCreation implements Action {
  id: string;
  campaignName: string;
  campaignId: string;
  type: "create";
  campaignPic: string | null;
  timestamp: string;

  constructor(response: CreationResponse["ninelives_campaigns_1"][number]) {
    this.id = response.id;
    this.campaignId = response.id;
    this.type = "create";
    this.campaignName = response.content.name;
    this.timestamp = response.created_at;
    this.campaignPic = response.content.picture;
  }
}
export class ActionFromBuysAndSells implements Action {
  id: string;
  campaignName: string;
  campaignId: string;
  type: "buy" | "sell";
  campaignPic: string | null;
  timestamp: string;
  campaignVol?: string;
  actionValue?: string;
  outcomeName?: string;

  constructor(
    response: BuyAndSellResponse["ninelives_buys_and_sells_1"][number],
  ) {
    (this.id = response.transaction_hash),
      (this.type = response.type),
      (this.campaignId = response.campaign_id),
      (this.campaignName = response.campaign_content.name),
      (this.timestamp = response.created_by),
      (this.campaignPic = response.campaign_content.picture),
      (this.campaignVol = formatFusdc(response.total_volume, 2)),
      (this.actionValue = formatFusdc(
        response.from_symbol === "FUSDC"
          ? response.from_amount
          : response.to_amount,
        2,
      )),
      (this.outcomeName = response.campaign_content.outcomes.find(
        (o) => o.identifier === `0x${response.outcome_id}`,
      )?.name);
  }
}
export class CampaignDto implements Campaign {
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  isYesNo: boolean;
  outcomes: Outcome[];
  name: string;
  description: string;
  winner: string | null;
  picture: string | null;
  oracleDescription: string | null;
  oracleUrls: (string | null)[] | null;
  settlement: SettlementType;
  ending: number;
  starting: number;
  totalVolume: number;
  creator: { address: string };
  constructor(
    rawCampaign: Awaited<ReturnType<typeof requestCampaignList>>[number],
  ) {
    this.identifier = rawCampaign.identifier as `0x${string}`;
    this.poolAddress = rawCampaign.poolAddress as `0x${string}`;
    this.isYesNo =
      rawCampaign.outcomes?.length === 2 &&
      rawCampaign.outcomes.findIndex((outcome) => outcome.name === "Yes") !==
        -1 &&
      rawCampaign.outcomes.findIndex((outcome) => outcome.name === "No") !== -1;
    this.outcomes = rawCampaign.outcomes?.map((o) => new OutcomeDto(o));
    this.name = rawCampaign.name;
    this.description = rawCampaign.description;
    this.winner = rawCampaign.winner;
    this.picture = rawCampaign.picture;
    this.oracleDescription = rawCampaign.oracleDescription;
    this.oracleUrls = rawCampaign.oracleUrls;
    this.settlement = rawCampaign.settlement;
    this.ending = rawCampaign.ending;
    this.starting = rawCampaign.starting;
    this.totalVolume = rawCampaign.totalVolume;
    this.creator = rawCampaign.creator;
  }
}
export class CampaignDetailDto extends CampaignDto {
  investmentAmounts: { id: string; usdc: number; share: number }[];
  liquidityVested: number;
  constructor(rc: Awaited<ReturnType<typeof requestCampaignById>>) {
    if (!rc) throw new Error("Campaign dto can not be null");
    super(rc);
    this.liquidityVested = rc.liquidityVested;
    this.investmentAmounts = rc.investmentAmounts.filter((a) => !!a);
  }
}
class OutcomeDto implements Outcome {
  identifier: `0x${string}`;
  name: string;
  picture: string | null;
  share: { address: `0x${string}` };
  constructor(
    ro: Awaited<
      ReturnType<typeof requestCampaignList>
    >[number]["outcomes"][number],
  ) {
    this.identifier = ro.identifier as `0x${string}`;
    this.name = ro.name;
    this.picture = ro.picture;
    this.share = { address: ro.share.address as `0x${string}` };
  }
}
export type PositionsProps = {
  campaignName: string;
  campaignId: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  winner?: string;
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

export type Ticket = {
  id: string;
  amount: string;
  account: Account;
  outcomeId: string;
  data: CampaignDetail;
};

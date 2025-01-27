import {
  requestCampaignList,
  requestLeaderboard,
  requestAchievments,
} from "./providers/graphqlClient";

export type Campaign = Omit<
  Awaited<typeof requestCampaignList>[number],
  "outcomes"
> & {
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  isYesNo: boolean;
  outcomes: Outcome[];
};
export type CampaignDetail = Campaign & {
  investmentAmounts: { id: string; usdc: number; share: number }[];
};
export type Outcome = {
  name: string;
  description: string;
  picture: string;
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
  desc: string;
  picture: string;
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
};
export type OutcomeInput = {
  picture: string;
  name: string;
  description: string;
  seed: number;
};
export type Action = {
  id: string;
  campaignName: string;
  campaignId: string;
  type: "create" | "buy" | "sell";
  campaignPic: string;
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
}
export const InfraMarketStateTitles: Record<InfraMarketState, string> = {
  [InfraMarketState.Callable]: "Callable",
  [InfraMarketState.Closable]: "Closable",
  [InfraMarketState.Whinging]: "Whinging",
  [InfraMarketState.Predicting]: "Predicting",
  [InfraMarketState.Revealing]: "Revealing",
  [InfraMarketState.Declarable]: "Declarable",
  [InfraMarketState.Sweeping]: "Sweeping",
  [InfraMarketState.Closed]: "Closed",
} as const;
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
  campaignPic: string;
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
  campaignPic: string;
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
      (this.campaignVol = (response.total_volume / 1e6).toFixed(2)),
      (this.actionValue = (
        (response.from_symbol === "FUSDC"
          ? response.from_amount
          : response.to_amount) / 1e6
      ).toFixed(2)),
      (this.outcomeName = response.campaign_content.outcomes.find(
        (o) => o.identifier === `0x${response.outcome_id}`,
      )?.name);
  }
}

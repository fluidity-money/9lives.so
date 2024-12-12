import {
  requestCampaignList,
  requestLeaderboard,
  requestAchievments,
} from "./providers/graphqlClient";

export type Campaign = Awaited<typeof requestCampaignList>[number] & {
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  isYesNo: boolean;
  outcomes: Outcome[];
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
>[number];
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
export type SettlementType = "oracle" | "poll" | "ai"; // exclude "contract" for now
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
  type: "create" | "buy" | "sell";
  campaignPic: string;
  timestamp: string;
  campaignVol?: string;
  actionValue?: string;
  outcomeName?: string;
};

import { CampaignListQuery, GetLeaderboardQuery } from "./gql/graphql";
import { GetAchievementsQuery } from "./gql/graphql";
export type Campaign = CampaignListQuery["campaigns"][number] & {
  identifier: `0x${string}`;
  poolAddress: `0x${string}`;
  outcomes: Outcome[];
};
export type Outcome =
  CampaignListQuery["campaigns"][number]["outcomes"][number] & {
    identifier: `0x${string}`;
    share: { address: `0x${string}` };
  };
export type SelectedOutcome = { id: string; state: "buy" | "sell" };
export type Leader =
  GetLeaderboardQuery["leaderboards"][number]["items"][number];
export type Achievement = GetAchievementsQuery["achievements"][number];
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
export type SettlementType = "url" | "beauty" | "contract" | "ai";
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
  settlementType?: SettlementType;
  urlCommitee: string;
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

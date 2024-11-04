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

import { CampaignListQuery } from "./gql/graphql";

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
export type Leader = {
  rank: string;
  user: `0x${string}`;
  profit: string;
  positions: string;
};

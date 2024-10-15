import { CampaignListQuery } from "./gql/graphql";

export type Campaign = CampaignListQuery["campaigns"][number] & {
  poolAddress: `0x${string}`;
  outcomes: Outcome[];
};
export type Outcome =
  CampaignListQuery["campaigns"][number]["outcomes"][number] & {
    identifier: `0x${string}`;
    share: { address: `0x${string}` };
  };
export type SelectedOutcome = { id: string; state: "buy" | "sell" };

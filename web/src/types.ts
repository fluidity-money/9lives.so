import { CampaignListQuery } from "./gql/graphql";

export type Campaign = CampaignListQuery["campaigns"][number] & {poolAddress: `0x${string}`};
export type Outcome = Campaign["outcomes"][number] & {identifier: `0x${string}`, share: {address: `0x${string}`}};
export type SelectedOutcome = Outcome & { bet: boolean };

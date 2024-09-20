import { CampaignListQuery } from "./gql/graphql";

export type Campaign = CampaignListQuery["campaigns"][number];
export type Outcome = Campaign["outcomes"][number];
export type SelectedOutcome = Outcome & { bet: boolean };

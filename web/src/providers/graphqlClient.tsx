import appConfig from "@/config";
import { Lives9 } from "@/graffle/lives9/__";
import { Points } from "@/graffle/points/__";
import { OutcomeInput } from "@/types";

const graph9Lives = Lives9.create().transport({
  url: appConfig.NEXT_PUBLIC_GRAPHQL_URL,
});
const graphPoints = Points.create().transport({
  url: appConfig.NEXT_PUBLIC_POINTS_URL,
});
export const requestCampaignList = graph9Lives.query.campaigns({
  name: true,
  identifier: true,
  description: true,
  picture: true,
  oracleDescription: true,
  oracleUrls: true,
  settlement: true,
  poolAddress: true,
  creator: {
    address: true,
  },
  outcomes: {
    identifier: true,
    name: true,
    description: true,
    picture: true,
    share: {
      address: true,
    },
  },
  ending: true,
  starting: true,
});
export const requestAchievments = (wallet?: string) =>
  graphPoints.query.achievements({
    $: { wallet },
    id: true,
    name: true,
    count: true,
    description: true,
    shouldCountMatter: true,
    product: true,
  });
export const requestLeaderboard = (season?: number) =>
  graphPoints.query.leaderboards({
    $: { product: "9lives", season },
    items: {
      wallet: true,
      ranking: true,
      scoring: true,
    },
  });
export const requestTotalUserCount = graphPoints.query.productUserCount({
  $: { product: "9lives" },
});
export const requestCreateCampaign = (params: {
  name: string;
  desc: string;
  picture: string;
  outcomes: OutcomeInput[];
  oracleDescription?: string;
  oracleUrls?: string[];
  seed: number;
  creator: string;
  ending: number;
  starting: number;
  x?: string;
  telegram?: string;
  web?: string;
}) =>
  graph9Lives.mutation.explainCampaign({
    $: {
      $type: "PUT",
      name: params.name,
      description: params.desc,
      picture: params.picture,
      outcomes: params.outcomes,
      seed: params.seed,
      creator: params.creator,
      oracleUrls: params.oracleUrls,
      ending: params.ending,
      starting: params.starting,
      oracleDescription: params.oracleDescription,
      x: params.x,
      telegram: params.telegram,
      web: params.web,
    },
  });
export const requestGetAITitles = graph9Lives.query.suggestedHeadlines();

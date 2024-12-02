/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query CampaignList {\n    campaigns {\n      name\n      identifier\n      description\n      picture\n      oracle\n      poolAddress\n      creator {\n        address\n      }\n      outcomes {\n        identifier\n        name\n        description\n        picture\n        share {\n          address\n        }\n      }\n      ending\n      starting\n    }\n  }\n": types.CampaignListDocument,
    "\n  query getAchievements($wallet: String) {\n    achievements(wallet: $wallet) {\n      id\n      name\n      count\n      description\n      shouldCountMatter\n      product\n    }\n  }\n": types.GetAchievementsDocument,
    "\n  query getLeaderboard($season: Int) {\n    leaderboards(product: \"9lives\", season: $season) {\n      id\n      items {\n        id\n        wallet\n        ranking\n        scoring\n      }\n    }\n  }\n": types.GetLeaderboardDocument,
    "\n  query getTotalUserCount {\n    productUserCount(product: \"9lives\")\n  }\n": types.GetTotalUserCountDocument,
    "\n  mutation createCampaign(\n    $name: String!\n    $desc: String!\n    $picture: String!\n    $outcomes: [OutcomeInput!]!\n    $seed: Int!\n    $creator: String!\n    $ending: Int!\n    $starting: Int!\n    $x: String\n    $telegram: String\n    $web: String\n  ) {\n    explainCampaign(\n      type: PUT\n      name: $name\n      description: $desc\n      picture: $picture\n      outcomes: $outcomes\n      ending: $ending\n      starting: $starting\n      creator: $creator\n      seed: $seed\n      x: $x\n      telegram: $telegram\n      web: $web\n    )\n  }\n": types.CreateCampaignDocument,
    "\n  query AITitles {\n    suggestedHeadlines\n  }\n": types.AiTitlesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CampaignList {\n    campaigns {\n      name\n      identifier\n      description\n      picture\n      oracle\n      poolAddress\n      creator {\n        address\n      }\n      outcomes {\n        identifier\n        name\n        description\n        picture\n        share {\n          address\n        }\n      }\n      ending\n      starting\n    }\n  }\n"): (typeof documents)["\n  query CampaignList {\n    campaigns {\n      name\n      identifier\n      description\n      picture\n      oracle\n      poolAddress\n      creator {\n        address\n      }\n      outcomes {\n        identifier\n        name\n        description\n        picture\n        share {\n          address\n        }\n      }\n      ending\n      starting\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getAchievements($wallet: String) {\n    achievements(wallet: $wallet) {\n      id\n      name\n      count\n      description\n      shouldCountMatter\n      product\n    }\n  }\n"): (typeof documents)["\n  query getAchievements($wallet: String) {\n    achievements(wallet: $wallet) {\n      id\n      name\n      count\n      description\n      shouldCountMatter\n      product\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getLeaderboard($season: Int) {\n    leaderboards(product: \"9lives\", season: $season) {\n      id\n      items {\n        id\n        wallet\n        ranking\n        scoring\n      }\n    }\n  }\n"): (typeof documents)["\n  query getLeaderboard($season: Int) {\n    leaderboards(product: \"9lives\", season: $season) {\n      id\n      items {\n        id\n        wallet\n        ranking\n        scoring\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getTotalUserCount {\n    productUserCount(product: \"9lives\")\n  }\n"): (typeof documents)["\n  query getTotalUserCount {\n    productUserCount(product: \"9lives\")\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createCampaign(\n    $name: String!\n    $desc: String!\n    $picture: String!\n    $outcomes: [OutcomeInput!]!\n    $seed: Int!\n    $creator: String!\n    $ending: Int!\n    $starting: Int!\n    $x: String\n    $telegram: String\n    $web: String\n  ) {\n    explainCampaign(\n      type: PUT\n      name: $name\n      description: $desc\n      picture: $picture\n      outcomes: $outcomes\n      ending: $ending\n      starting: $starting\n      creator: $creator\n      seed: $seed\n      x: $x\n      telegram: $telegram\n      web: $web\n    )\n  }\n"): (typeof documents)["\n  mutation createCampaign(\n    $name: String!\n    $desc: String!\n    $picture: String!\n    $outcomes: [OutcomeInput!]!\n    $seed: Int!\n    $creator: String!\n    $ending: Int!\n    $starting: Int!\n    $x: String\n    $telegram: String\n    $web: String\n  ) {\n    explainCampaign(\n      type: PUT\n      name: $name\n      description: $desc\n      picture: $picture\n      outcomes: $outcomes\n      ending: $ending\n      starting: $starting\n      creator: $creator\n      seed: $seed\n      x: $x\n      telegram: $telegram\n      web: $web\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AITitles {\n    suggestedHeadlines\n  }\n"): (typeof documents)["\n  query AITitles {\n    suggestedHeadlines\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
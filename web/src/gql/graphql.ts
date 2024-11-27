/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Achievement = {
  __typename?: 'Achievement';
  /** Number of the achievement that was won. May be a unscaled number. */
  count: Scalars['Int']['output'];
  /** The descirption of this achievement. */
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /**
   * Is the count financial? This could dissuade the UI from displaying this item if so. Or,
   * enabling some scaling functionality.
   */
  isCountFinancial: Scalars['Boolean']['output'];
  /** Name of the achievement earned. */
  name?: Maybe<Scalars['String']['output']>;
  /** Product that this achievement was for. */
  product: Scalars['String']['output'];
  /** The amount of scoring for this achievement. NOTE THAT THESE ARE NOT POINTS! */
  scoring: Scalars['Float']['output'];
  /** The season that this achievement is for. */
  season: Scalars['Int']['output'];
  /**
   * Whether this achievement counts the amount of interactions with it, or its a one time
   * interaction. It might be better to not display the count of in a "this is how many
   * people have this" context if it's the former.
   */
  shouldCountMatter: Scalars['Boolean']['output'];
};

/** Ongoing prediction market competition. */
export type Campaign = {
  __typename?: 'Campaign';
  /** Creator of the campaign. */
  creator: Wallet;
  /** Description of the campaign in simple text. */
  description: Scalars['String']['output'];
  /** Ending date of the campaign in timestamp */
  ending: Scalars['Int']['output'];
  /**
   * Identifier that's used to do offline derivation of the campaign pool,
   * and the outcome shares. Is keccak256(concatenated outcome ids)[:8].
   */
  identifier: Scalars['String']['output'];
  /**
   * Name of the campaign. Also used to look up the campaign based on the slug
   * if needed (hyphenated).
   */
  name: Scalars['String']['output'];
  /** Oracle that can decide if a winner happened. */
  oracle: Scalars['String']['output'];
  /**
   * Outcomes associated with this campaign. If there are only two, it defaults
   * to a "yes", or "no".
   */
  outcomes: Array<Outcome>;
  /** Pool address to purchase shares, and to receive the cost function. */
  poolAddress: Scalars['String']['output'];
  /** Expected starting timestamp. */
  starting: Scalars['Int']['output'];
  /** Telegram username */
  telegram?: Maybe<Scalars['String']['output']>;
  /** Web url */
  web?: Maybe<Scalars['String']['output']>;
  /** X/Twitter username */
  x?: Maybe<Scalars['String']['output']>;
};

/**
 * News that could be rendered to a viewer who hasn't viewed the site in a while.
 * This is CHANGELOG.md that's parsed to be of the form:
 * ```
 * ### (date) (description)
 *
 * * Markdown unsorted list
 *
 * 1. Markdown sorted list
 *
 * ... yadda yadda
 * ```
 *
 * This is converted to HTML.
 */
export type Changelog = {
  __typename?: 'Changelog';
  /** The timestamp that this item is relevant for after. */
  afterTs: Scalars['Int']['output'];
  /** HTML rendered from the Markdown CHANGELOG.md file. */
  html: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** The title of the changelog item. */
  title: Scalars['String']['output'];
};

/** Frontpage that should be displayed for a time window. */
export type Frontpage = {
  __typename?: 'Frontpage';
  /** Categories that should be displayed on the frontend in the list. */
  categories: Array<Scalars['String']['output']>;
  /** Campaign item which is assigned. */
  content: Campaign;
  /** From when this should be displayed (timestamp)! */
  from: Scalars['Int']['output'];
  /** ID that's used to cache this frontend data. */
  id: Scalars['ID']['output'];
  /** Until when this should be displayed (timestamp)! */
  until: Scalars['Int']['output'];
};

export type Leaderboard = {
  __typename?: 'Leaderboard';
  id: Scalars['ID']['output'];
  /** The amount of items in this leaderboard. */
  items: Array<LeaderboardItem>;
  /** The product this leaderboard is for. Could be 9lives or longtail. */
  product: Scalars['String']['output'];
};

export type LeaderboardItem = {
  __typename?: 'LeaderboardItem';
  id: Scalars['ID']['output'];
  /** The ranking of the wallet. Ie, 1 for first place (the top). */
  ranking: Scalars['Int']['output'];
  /** The scoring of the wallet for their cumulative count achievement value. */
  scoring: Scalars['Int']['output'];
  /** The wallet that sits in the leaderboard this way. */
  wallet: Scalars['String']['output'];
};

/**
 * HTTP-like interface for mutation. Either a delete, a logical update, or a put for the
 * first time.
 */
export enum Modification {
  /** Delete this modification. */
  Delete = 'DELETE',
  /** Create this modification. */
  Put = 'PUT'
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Add achievement for an address or Discord handle given. */
  addAchievement: Scalars['Boolean']['output'];
  /**
   * Authenticate with the info service using the key given. Secret string that should be set
   * with Authorization.
   */
  auth?: Maybe<Scalars['String']['output']>;
  /**
   * Calculate points based on the data lake available. Does so using a function with an
   * advisory lock. Can only be used by an authenticated user sending a Authentication token.
   */
  calculatePoints: Scalars['Boolean']['output'];
  /** "Explain" a campaign, so an on-chain campaign creation is listed in the frontend. Campaign is then spooled in a would-be frontend aggregation table. */
  explainCampaign?: Maybe<Scalars['Boolean']['output']>;
  /**
   * Register a Discord username with an address given. Does verification
   * to see if a trusted user is making this association.
   */
  registerDiscord: Scalars['Boolean']['output'];
};


export type MutationAddAchievementArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  count?: InputMaybe<Scalars['Int']['input']>;
  discordUsername?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationAuthArgs = {
  key: Scalars['String']['input'];
};


export type MutationCalculatePointsArgs = {
  yes: Scalars['Boolean']['input'];
};


export type MutationExplainCampaignArgs = {
  creator: Scalars['String']['input'];
  description: Scalars['String']['input'];
  ending: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  outcomes: Array<OutcomeInput>;
  seed: Scalars['Int']['input'];
  starting: Scalars['Int']['input'];
  telegram?: InputMaybe<Scalars['String']['input']>;
  type: Modification;
  web?: InputMaybe<Scalars['String']['input']>;
  x?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRegisterDiscordArgs = {
  address: Scalars['String']['input'];
  snowflake: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Outcome = {
  __typename?: 'Outcome';
  /** Text description of this campaign. */
  description: Scalars['String']['output'];
  /**
   * Identifier hex encoded associated with this outcome. Used to derive addresses.
   * Is of the form keccak256("o" . name . "d" . description . "s" . seed)[:8]
   */
  identifier: Scalars['String']['output'];
  /** Name of this campaign. */
  name: Scalars['String']['output'];
  /** Share address to trade this outcome. */
  share: Share;
};

/** Outcome associated with a Campaign creation that's notified to the graph. */
export type OutcomeInput = {
  /** Text description of the outcome. */
  description: Scalars['String']['input'];
  /** Name of the campaign outcome. Ie, "Donald Trump" for the election. */
  name: Scalars['String']['input'];
  /** Randomly chosen seed for the creation of the identifier. */
  seed: Scalars['Int']['input'];
};

export type Points = {
  __typename?: 'Points';
  /** Amount of points that're given to this user so far. */
  amount: Scalars['Int']['output'];
  /** ID of the points of the form "address" */
  id: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  /**
   * Get achievements for the address given, or the category.
   * If the product is requested, then the count will be 0.
   */
  achievements: Array<Achievement>;
  /** Campaign List that can be filtered according to categories */
  campaigns: Array<Campaign>;
  /** Any new changelog items that have come up recently. */
  changelog: Array<Maybe<Changelog>>;
  /**
   * Frontpage display. Should have a timeline as to when it should (from) and should
   * not be displayed (until).
   */
  frontpage: Array<Frontpage>;
  /**
   * Returns html string with embded points data for the wallet.
   * This is a common points component to be used in every products.
   */
  getPointsComponent?: Maybe<Scalars['String']['output']>;
  /** Gets a sorted ranking of the address * achievement count for a specific product. */
  leaderboards: Array<Leaderboard>;
  /** Get points for the address given. */
  points: Points;
  /** Number of users who used this product. */
  productUserCount: Scalars['Int']['output'];
  /** Suggested headlines for the day based on AI input. */
  suggestedHeadlines: Array<Scalars['String']['output']>;
};


export type QueryAchievementsArgs = {
  wallet?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCampaignsArgs = {
  category?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryFrontpageArgs = {
  category?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetPointsComponentArgs = {
  wallet?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLeaderboardsArgs = {
  product: Scalars['String']['input'];
  season?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPointsArgs = {
  wallet: Scalars['String']['input'];
};


export type QueryProductUserCountArgs = {
  product: Scalars['String']['input'];
};

/** Share representing the outcome of the current amount. */
export type Share = {
  __typename?: 'Share';
  /** ERC20 address of this campaign. */
  address: Scalars['String']['output'];
};

/** Wallet of the creator. */
export type Wallet = {
  __typename?: 'Wallet';
  /** Wallet address of this wallet, in hex. */
  address: Scalars['String']['output'];
};

export type CampaignListQueryVariables = Exact<{ [key: string]: never; }>;


export type CampaignListQuery = { __typename?: 'Query', campaigns: Array<{ __typename?: 'Campaign', name: string, identifier: string, description: string, oracle: string, poolAddress: string, ending: number, creator: { __typename?: 'Wallet', address: string }, outcomes: Array<{ __typename?: 'Outcome', identifier: string, name: string, description: string, share: { __typename?: 'Share', address: string } }> }> };

export type GetAchievementsQueryVariables = Exact<{
  wallet?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAchievementsQuery = { __typename?: 'Query', achievements: Array<{ __typename?: 'Achievement', id: string, name?: string | null, count: number, description: string, shouldCountMatter: boolean, product: string }> };

export type GetLeaderboardQueryVariables = Exact<{
  season?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetLeaderboardQuery = { __typename?: 'Query', leaderboards: Array<{ __typename?: 'Leaderboard', id: string, items: Array<{ __typename?: 'LeaderboardItem', id: string, wallet: string, ranking: number, scoring: number }> }> };

export type GetTotalUserCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTotalUserCountQuery = { __typename?: 'Query', productUserCount: number };

export type CreateCampaignMutationVariables = Exact<{
  name: Scalars['String']['input'];
  desc: Scalars['String']['input'];
  outcomes: Array<OutcomeInput> | OutcomeInput;
  seed: Scalars['Int']['input'];
  creator: Scalars['String']['input'];
  ending: Scalars['Int']['input'];
  starting: Scalars['Int']['input'];
  x?: InputMaybe<Scalars['String']['input']>;
  telegram?: InputMaybe<Scalars['String']['input']>;
  web?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateCampaignMutation = { __typename?: 'Mutation', explainCampaign?: boolean | null };


export const CampaignListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CampaignList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"campaigns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"oracle"}},{"kind":"Field","name":{"kind":"Name","value":"poolAddress"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outcomes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"share"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"ending"}}]}}]}}]} as unknown as DocumentNode<CampaignListQuery, CampaignListQueryVariables>;
export const GetAchievementsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAchievements"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"wallet"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"achievements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"wallet"},"value":{"kind":"Variable","name":{"kind":"Name","value":"wallet"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shouldCountMatter"}},{"kind":"Field","name":{"kind":"Name","value":"product"}}]}}]}}]} as unknown as DocumentNode<GetAchievementsQuery, GetAchievementsQueryVariables>;
export const GetLeaderboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getLeaderboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"season"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaderboards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product"},"value":{"kind":"StringValue","value":"9lives","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"season"},"value":{"kind":"Variable","name":{"kind":"Name","value":"season"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"wallet"}},{"kind":"Field","name":{"kind":"Name","value":"ranking"}},{"kind":"Field","name":{"kind":"Name","value":"scoring"}}]}}]}}]}}]} as unknown as DocumentNode<GetLeaderboardQuery, GetLeaderboardQueryVariables>;
export const GetTotalUserCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getTotalUserCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productUserCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product"},"value":{"kind":"StringValue","value":"9lives","block":false}}]}]}}]} as unknown as DocumentNode<GetTotalUserCountQuery, GetTotalUserCountQueryVariables>;
export const CreateCampaignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createCampaign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"desc"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"outcomes"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OutcomeInput"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"seed"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"creator"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ending"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"starting"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"x"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"telegram"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"web"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"explainCampaign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"PUT"}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"desc"}}},{"kind":"Argument","name":{"kind":"Name","value":"outcomes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"outcomes"}}},{"kind":"Argument","name":{"kind":"Name","value":"ending"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ending"}}},{"kind":"Argument","name":{"kind":"Name","value":"starting"},"value":{"kind":"Variable","name":{"kind":"Name","value":"starting"}}},{"kind":"Argument","name":{"kind":"Name","value":"creator"},"value":{"kind":"Variable","name":{"kind":"Name","value":"creator"}}},{"kind":"Argument","name":{"kind":"Name","value":"seed"},"value":{"kind":"Variable","name":{"kind":"Name","value":"seed"}}},{"kind":"Argument","name":{"kind":"Name","value":"x"},"value":{"kind":"Variable","name":{"kind":"Name","value":"x"}}},{"kind":"Argument","name":{"kind":"Name","value":"telegram"},"value":{"kind":"Variable","name":{"kind":"Name","value":"telegram"}}},{"kind":"Argument","name":{"kind":"Name","value":"web"},"value":{"kind":"Variable","name":{"kind":"Name","value":"web"}}}]}]}}]} as unknown as DocumentNode<CreateCampaignMutation, CreateCampaignMutationVariables>;
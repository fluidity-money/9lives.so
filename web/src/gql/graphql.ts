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

/** Ongoing prediction market competition. */
export type Campaign = {
  __typename?: 'Campaign';
  /** Creator of the campaign. */
  creator: Wallet;
  /** Description of the campaign in simple text. */
  description: Scalars['String']['output'];
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
};

/** Frontpage that should be displayed for a time window. */
export type Frontpage = {
  __typename?: 'Frontpage';
  /** Campaigns displayed left from right in the grid format. */
  campaigns: Array<Campaign>;
  /** Categories that should be displayed on the frontend in the list. */
  categories: Array<Scalars['String']['output']>;
  /** From when this should be displayed (timestamp)! */
  from: Scalars['Int']['output'];
  /** ID that's used to cache this frontend data. */
  id: Scalars['ID']['output'];
  /** Until when this should be displayed (timestamp)! */
  until: Scalars['Int']['output'];
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
  /** "Explain" a campaign, so an on-chain campaign creation is listed in the frontend. Campaign is then spooled in a would-be frontend aggregation table. */
  explainCampaign?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationExplainCampaignArgs = {
  creator: Scalars['String']['input'];
  description: Scalars['String']['input'];
  ending: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  outcomes: Array<OutcomeInput>;
  seed: Scalars['Int']['input'];
  type: Modification;
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

export type Query = {
  __typename?: 'Query';
  /** Campaign List */
  campaigns?: Maybe<Array<Maybe<Campaign>>>;
  /**
   * Frontpage display. Should have a timeline as to when it should and should
   * not be displayed.
   */
  frontpage: Array<Frontpage>;
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


export type CampaignListQuery = { __typename?: 'Query', campaigns?: Array<{ __typename?: 'Campaign', name: string, identifier: string, description: string, oracle: string, poolAddress: string, outcomes: Array<{ __typename?: 'Outcome', identifier: string, name: string, share: { __typename?: 'Share', address: string } }> } | null> | null };


export const CampaignListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CampaignList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"campaigns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"oracle"}},{"kind":"Field","name":{"kind":"Name","value":"poolAddress"}},{"kind":"Field","name":{"kind":"Name","value":"outcomes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"share"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CampaignListQuery, CampaignListQueryVariables>;
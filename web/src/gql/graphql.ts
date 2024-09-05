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
   * and the outcome shares. Is keccak256("c" . name . "d" . description . "s" . seed)[:8].
   */
  identifier: Scalars['String']['output'];
  /** Name of the campaign. */
  name: Scalars['String']['output'];
  /** Oracle that can decide if a winner happened. */
  oracle: Scalars['String']['output'];
  /** Outcomes associated with this campaign. */
  outcomes: Array<Outcome>;
  /** Pool address to purchase shares, and to receive the cost function. */
  poolAddress: Scalars['String']['output'];
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
  explainCampaign?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationExplainCampaignArgs = {
  creator: Scalars['String']['input'];
  ending: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  outcomes: Array<OutcomeInput>;
  s: Scalars['String']['input'];
  sR: Scalars['String']['input'];
  seed: Scalars['Int']['input'];
  text: Scalars['String']['input'];
  type: Modification;
  v: Scalars['String']['input'];
};

export type Outcome = {
  __typename?: 'Outcome';
  /** Campaign this outcome is associated with. */
  campaign: Campaign;
  /** Address of the creator. */
  creator: Wallet;
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
  /** Identifier hex encoded associated with this outcome. Used to derive addresses. */
  identifier: Scalars['String']['input'];
  /** Name of the campaign outcome. Ie, "Donald Trump" for the election. */
  name: Scalars['String']['input'];
  /** Randomly chosen seed for the creation of the identifier. */
  seed: Scalars['Int']['input'];
};

export type Query = {
  __typename?: 'Query';
  /** Campaigns that are currently ongoing. */
  campaigns: Array<Campaign>;
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


export type CampaignListQuery = { __typename?: 'Query', campaigns: Array<{ __typename?: 'Campaign', name: string, identifier: string, description: string, oracle: string, poolAddress: string, outcomes: Array<{ __typename?: 'Outcome', name: string, share: { __typename?: 'Share', address: string } }> }> };


export const CampaignListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CampaignList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"campaigns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"identifier"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"oracle"}},{"kind":"Field","name":{"kind":"Name","value":"poolAddress"}},{"kind":"Field","name":{"kind":"Name","value":"outcomes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"share"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CampaignListQuery, CampaignListQueryVariables>;
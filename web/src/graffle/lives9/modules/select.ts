import * as $$Data from "./data";
import * as $$Schema from "./schema";
import * as $$SelectionSets from "./selection-sets";
import type { OperationTypeNode } from "graphql";
import type { InferResult } from "graffle/schema";

//
//
//
//
//
//
// ==================================================================================================
//                                              Runtime
// ==================================================================================================
//
//
//
//
//
//
import { createSelect } from "graffle/client";
export const Select = createSelect($$Data.Name);

//
//
//
//
//
//
// ==================================================================================================
//                                             Buildtime
// ==================================================================================================
//
//
//
//
//
//

export namespace Select {
  //                                                Root
  // --------------------------------------------------------------------------------------------------
  //
  export type Query<$SelectionSet extends $$SelectionSets.Query> =
    InferResult.Operation<
      $SelectionSet,
      $$Schema.Schema,
      OperationTypeNode.QUERY
    >;
  export type Mutation<$SelectionSet extends $$SelectionSets.Mutation> =
    InferResult.Operation<
      $SelectionSet,
      $$Schema.Schema,
      OperationTypeNode.MUTATION
    >;
  //                                            OutputObject
  // --------------------------------------------------------------------------------------------------
  //
  export type PriceEvent<$SelectionSet extends $$SelectionSets.PriceEvent> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["PriceEvent"]
    >;
  export type CommentInvestment<
    $SelectionSet extends $$SelectionSets.CommentInvestment,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["CommentInvestment"]
  >;
  export type Comment<$SelectionSet extends $$SelectionSets.Comment> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Comment"]
    >;
  export type LP<$SelectionSet extends $$SelectionSets.LP> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["LP"]
    >;
  export type CampaignProfit<
    $SelectionSet extends $$SelectionSets.CampaignProfit,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["CampaignProfit"]
  >;
  export type Settings<$SelectionSet extends $$SelectionSets.Settings> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Settings"]
    >;
  export type Profile<$SelectionSet extends $$SelectionSets.Profile> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Profile"]
    >;
  export type Claim<$SelectionSet extends $$SelectionSets.Claim> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Claim"]
    >;
  export type Position<$SelectionSet extends $$SelectionSets.Position> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Position"]
    >;
  export type Campaign<$SelectionSet extends $$SelectionSets.Campaign> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Campaign"]
    >;
  export type CampaignShare<
    $SelectionSet extends $$SelectionSets.CampaignShare,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["CampaignShare"]
  >;
  export type LeaderboardPosition<
    $SelectionSet extends $$SelectionSets.LeaderboardPosition,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["LeaderboardPosition"]
  >;
  export type LeaderboardWeekly<
    $SelectionSet extends $$SelectionSets.LeaderboardWeekly,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["LeaderboardWeekly"]
  >;
  export type InvestmentAmounts<
    $SelectionSet extends $$SelectionSets.InvestmentAmounts,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["InvestmentAmounts"]
  >;
  export type Outcome<$SelectionSet extends $$SelectionSets.Outcome> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Outcome"]
    >;
  export type Wallet<$SelectionSet extends $$SelectionSets.Wallet> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Wallet"]
    >;
  export type Share<$SelectionSet extends $$SelectionSets.Share> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Share"]
    >;
  export type Changelog<$SelectionSet extends $$SelectionSets.Changelog> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Changelog"]
    >;
  export type Activity<$SelectionSet extends $$SelectionSets.Activity> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Activity"]
    >;
  //                                               Union
  // --------------------------------------------------------------------------------------------------
  //

  //                                             Interface
  // --------------------------------------------------------------------------------------------------
  //
}

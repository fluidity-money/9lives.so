import * as $$Data from "./data.js";
import * as $$Schema from "./schema.js";
import * as $$SelectionSets from "./selection-sets.js";
import type { OperationTypeNode } from "graphql";
import type * as $$Utilities from "graffle/utilities-for-generated";

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
    $$Utilities.DocumentBuilderKit.InferResult.Operation<
      $SelectionSet,
      $$Schema.Schema,
      OperationTypeNode.QUERY
    >;
  export type Mutation<$SelectionSet extends $$SelectionSets.Mutation> =
    $$Utilities.DocumentBuilderKit.InferResult.Operation<
      $SelectionSet,
      $$Schema.Schema,
      OperationTypeNode.MUTATION
    >;
  //                                            OutputObject
  // --------------------------------------------------------------------------------------------------
  //
  export type PriceEvent<$SelectionSet extends $$SelectionSets.PriceEvent> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["PriceEvent"]
    >;
  export type CommentInvestment<
    $SelectionSet extends $$SelectionSets.CommentInvestment,
  > = $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["CommentInvestment"]
  >;
  export type Comment<$SelectionSet extends $$SelectionSets.Comment> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Comment"]
    >;
  export type LP<$SelectionSet extends $$SelectionSets.LP> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["LP"]
    >;
  export type CampaignProfit<
    $SelectionSet extends $$SelectionSets.CampaignProfit,
  > = $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["CampaignProfit"]
  >;
  export type Settings<$SelectionSet extends $$SelectionSets.Settings> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Settings"]
    >;
  export type Profile<$SelectionSet extends $$SelectionSets.Profile> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Profile"]
    >;
  export type Claim<$SelectionSet extends $$SelectionSets.Claim> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Claim"]
    >;
  export type Position<$SelectionSet extends $$SelectionSets.Position> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Position"]
    >;
  export type Campaign<$SelectionSet extends $$SelectionSets.Campaign> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Campaign"]
    >;
  export type CampaignShare<
    $SelectionSet extends $$SelectionSets.CampaignShare,
  > = $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["CampaignShare"]
  >;
  export type LeaderboardPosition<
    $SelectionSet extends $$SelectionSets.LeaderboardPosition,
  > = $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["LeaderboardPosition"]
  >;
  export type LeaderboardWeekly<
    $SelectionSet extends $$SelectionSets.LeaderboardWeekly,
  > = $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["LeaderboardWeekly"]
  >;
  export type InvestmentAmounts<
    $SelectionSet extends $$SelectionSets.InvestmentAmounts,
  > = $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["InvestmentAmounts"]
  >;
  export type Outcome<$SelectionSet extends $$SelectionSets.Outcome> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Outcome"]
    >;
  export type Wallet<$SelectionSet extends $$SelectionSets.Wallet> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Wallet"]
    >;
  export type Share<$SelectionSet extends $$SelectionSets.Share> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Share"]
    >;
  export type Changelog<$SelectionSet extends $$SelectionSets.Changelog> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Changelog"]
    >;
  export type Activity<$SelectionSet extends $$SelectionSets.Activity> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
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

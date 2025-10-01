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
  export type Achievement<$SelectionSet extends $$SelectionSets.Achievement> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Achievement"]
    >;
  export type Leaderboard<$SelectionSet extends $$SelectionSets.Leaderboard> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Leaderboard"]
    >;
  export type LeaderboardItem<
    $SelectionSet extends $$SelectionSets.LeaderboardItem,
  > = $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["LeaderboardItem"]
  >;
  export type Points<$SelectionSet extends $$SelectionSets.Points> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Points"]
    >;
  export type TokenHolding<$SelectionSet extends $$SelectionSets.TokenHolding> =
    $$Utilities.DocumentBuilderKit.InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["TokenHolding"]
    >;
  //                                               Union
  // --------------------------------------------------------------------------------------------------
  //

  //                                             Interface
  // --------------------------------------------------------------------------------------------------
  //
}

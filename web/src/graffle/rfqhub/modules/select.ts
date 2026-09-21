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
  export type OpenAuction<$SelectionSet extends $$SelectionSets.OpenAuction> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["OpenAuction"]
    >;
  export type OpenAuctions<$SelectionSet extends $$SelectionSets.OpenAuctions> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["OpenAuctions"]
    >;
  export type AuctionCreatedResult<
    $SelectionSet extends $$SelectionSets.AuctionCreatedResult,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["AuctionCreatedResult"]
  >;
  export type BundleMakerInfo<
    $SelectionSet extends $$SelectionSets.BundleMakerInfo,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["BundleMakerInfo"]
  >;
  export type BundleTakerOwnerStatus<
    $SelectionSet extends $$SelectionSets.BundleTakerOwnerStatus,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["BundleTakerOwnerStatus"]
  >;
  export type AggregateBundleTaker<
    $SelectionSet extends $$SelectionSets.AggregateBundleTaker,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["AggregateBundleTaker"]
  >;
  export type AggregateBundleMaker<
    $SelectionSet extends $$SelectionSets.AggregateBundleMaker,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["AggregateBundleMaker"]
  >;
  export type Aggregate<$SelectionSet extends $$SelectionSets.Aggregate> =
    InferResult.OutputObjectLike<
      $SelectionSet,
      $$Schema.Schema,
      $$Schema.Schema["allTypes"]["Aggregate"]
    >;
  //                                               Union
  // --------------------------------------------------------------------------------------------------
  //

  //                                             Interface
  // --------------------------------------------------------------------------------------------------
  //
}

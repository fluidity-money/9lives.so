import * as $$SelectionSets from "./selection-sets";
import type * as $$Utilities from "graffle/utilities-for-generated";

//
//
//
//
//
//
// ==================================================================================================
//                                      Select Methods Interface
// ==================================================================================================
//
//
//
//
//
//

export interface $MethodsSelect {
  Query: Query;
  Mutation: Mutation;
  OpenAuction: OpenAuction;
  OpenAuctions: OpenAuctions;
  AuctionCreatedResult: AuctionCreatedResult;
  BundleMakerInfo: BundleMakerInfo;
  BundleTakerOwnerStatus: BundleTakerOwnerStatus;
  AggregateBundleTaker: AggregateBundleTaker;
  AggregateBundleMaker: AggregateBundleMaker;
  Aggregate: Aggregate;
}

//
//
//
//
//
//
// ==================================================================================================
//                                                Root
// ==================================================================================================
//
//
//
//
//
//

export interface Query {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<$SelectionSet, $$SelectionSets.Query>,
  ): $SelectionSet;
}

export interface Mutation {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<$SelectionSet, $$SelectionSets.Mutation>,
  ): $SelectionSet;
}

//
//
//
//
//
//
// ==================================================================================================
//                                            OutputObject
// ==================================================================================================
//
//
//
//
//
//

export interface OpenAuction {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<$SelectionSet, $$SelectionSets.OpenAuction>,
  ): $SelectionSet;
}

export interface OpenAuctions {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.OpenAuctions
    >,
  ): $SelectionSet;
}

export interface AuctionCreatedResult {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.AuctionCreatedResult
    >,
  ): $SelectionSet;
}

export interface BundleMakerInfo {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.BundleMakerInfo
    >,
  ): $SelectionSet;
}

export interface BundleTakerOwnerStatus {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.BundleTakerOwnerStatus
    >,
  ): $SelectionSet;
}

export interface AggregateBundleTaker {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.AggregateBundleTaker
    >,
  ): $SelectionSet;
}

export interface AggregateBundleMaker {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.AggregateBundleMaker
    >,
  ): $SelectionSet;
}

export interface Aggregate {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<$SelectionSet, $$SelectionSets.Aggregate>,
  ): $SelectionSet;
}

//
//
//
//
//
//
// ==================================================================================================
//                                               Union
// ==================================================================================================
//
//
//
//
//
//

//
//
//
//
//
//
// ==================================================================================================
//                                             Interface
// ==================================================================================================
//
//
//
//
//
//

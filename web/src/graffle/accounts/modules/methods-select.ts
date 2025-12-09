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
  CreateAccountExec: CreateAccountExec;
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

export interface CreateAccountExec {
  <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.CreateAccountExec
    >,
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

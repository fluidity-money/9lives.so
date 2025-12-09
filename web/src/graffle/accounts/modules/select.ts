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
  export type CreateAccountExec<
    $SelectionSet extends $$SelectionSets.CreateAccountExec,
  > = InferResult.OutputObjectLike<
    $SelectionSet,
    $$Schema.Schema,
    $$Schema.Schema["allTypes"]["CreateAccountExec"]
  >;
  //                                               Union
  // --------------------------------------------------------------------------------------------------
  //

  //                                             Interface
  // --------------------------------------------------------------------------------------------------
  //
}

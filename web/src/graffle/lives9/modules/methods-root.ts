import * as $$SelectionSets from "./selection-sets";
import * as $$Schema from "./schema";
import type * as $$Utilities from "graffle/utilities-for-generated";
import type { InferResult } from "graffle/schema";

export interface QueryMethods<$Context extends $$Utilities.Context> {
  $batch: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Query<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutput<
        $Context,
        InferResult.OperationQuery<
          $$Utilities.AssertExtendsObject<$SelectionSet>,
          $$Schema.Schema<$Context["scalars"]>
        >
      >
  >;
  __typename: () => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        { __typename: "Query" },
        "__typename"
      >
  >;
  /**
   * Campaign List that can be filtered according to categories
   */
  campaigns: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Query.campaigns<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationQuery<
          { campaigns: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "campaigns"
      >
  >;
  /**
   * Frontpage display. Should have a timeline as to when it should (from) and should
   * not be displayed (until).
   */
  frontpage: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Query.frontpage<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationQuery<
          { frontpage: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "frontpage"
      >
  >;
  /**
   * Suggested headlines for the day based on AI input.
   */
  suggestedHeadlines: <$SelectionSet>(
    selectionSet?: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Query.suggestedHeadlines<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationQuery<
          { suggestedHeadlines: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "suggestedHeadlines"
      >
  >;
  /**
   * Any new changelog items that have come up recently.
   */
  changelog: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Query.changelog<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationQuery<
          { changelog: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "changelog"
      >
  >;
}

export interface MutationMethods<$Context extends $$Utilities.Context> {
  $batch: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Mutation<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutput<
        $Context,
        InferResult.OperationMutation<
          $$Utilities.AssertExtendsObject<$SelectionSet>,
          $$Schema.Schema<$Context["scalars"]>
        >
      >
  >;
  __typename: () => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        { __typename: "Mutation" },
        "__typename"
      >
  >;
  /**
   * "Explain" a campaign, so an on-chain campaign creation is listed in the frontend. Campaign is then spooled in a would-be frontend aggregation table.
   */
  explainCampaign: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Mutation.explainCampaign<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationMutation<
          { explainCampaign: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "explainCampaign"
      >
  >;
}

export interface BuilderMethodsRoot<$Context extends $$Utilities.Context> {
  query: QueryMethods<$Context>;
  mutation: MutationMethods<$Context>;
}

export interface BuilderMethodsRootFn extends $$Utilities.TypeFunction {
  // @ts-expect-error parameter is Untyped.
  return: BuilderMethodsRoot<this["params"]>;
}

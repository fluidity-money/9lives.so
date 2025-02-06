import * as $$SelectionSets from "./selection-sets";
import * as $$Schema from "./schema";
import type * as $$Utilities from "graffle/utilities-for-generated";
import type { InferResult } from "graffle/schema";

export interface QueryMethods<$Context extends $$Utilities.Context> {
  $batch: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
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
    >
  >;
  __typename: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    () => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          { __typename: "Query" },
          "__typename"
        >
    >
  >;
  /**
   * Campaign List that can be filtered according to categories
   */
  campaigns: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
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
    >
  >;
  /**
   * Search campaigns with name
   */
  searchCampaigns: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.searchCampaigns<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { searchCampaigns: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "searchCampaigns"
        >
    >
  >;
  /**
   * Get a campaign by its ID. May or may not exist.
   */
  campaignById: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.campaignById<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { campaignById: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "campaignById"
        >
    >
  >;
  /**
   * Suggested headlines for the day based on AI input.
   */
  suggestedHeadlines: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
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
    >
  >;
  /**
   * Any new changelog items that have come up recently.
   */
  changelog: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
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
    >
  >;
}

export interface MutationMethods<$Context extends $$Utilities.Context> {
  $batch: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
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
    >
  >;
  __typename: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    () => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          { __typename: "Mutation" },
          "__typename"
        >
    >
  >;
  /**
   * "Explain" a campaign, so an on-chain campaign creation is listed in the frontend.
   * Campaign is then spooled in a would-be frontend aggregation table.
   */
  explainCampaign: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
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
    >
  >;
  /**
   * Reveal a commitment, including a hash, to the server. It's okay for us to be
   * permissive with the input that we accept, since a sophisticated worker will simulate
   * these calls to identify the correct approach for submitting on behalf of a user. If
   * a user were to spam submissions, the impact would be negligible thankfully. However,
   * in those degraded scenarios where we pass 10 submissions, in the calling of this
   * function, it's possible for the backend to notify the frontend that it needs to use
   * revealCommitment2, which takes a signature. This will always return false,
   * unless the frontend should be prompted to provide a signature.
   */
  revealCommitment: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet?: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.revealCommitment<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { revealCommitment: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "revealCommitment"
        >
    >
  >;
  /**
   * The degraded form of revealCommitment, this is a version that needs to be used when
   * there's an overabundance of signatures (more than 10), perhaps indicating some form of
   * griefing. This should begin to be used after the server has indicated receipt of
   * revealCommitment, but it's returned true. It's identical to revealCommitment, except
   * gated with a signature, and will reject the user's submission unless they provide a
   * correct signature. True will always be returned here.
   */
  revealCommitment2: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet?: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.revealCommitment2<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { revealCommitment2: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "revealCommitment2"
        >
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

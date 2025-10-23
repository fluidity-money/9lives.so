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
  /**
   * Returns user's buy and sell activities
   */
  userActivity: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.userActivity<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { userActivity: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "userActivity"
        >
    >
  >;
  /**
   * Returns user's participated positions as pool address of the campaigns
   * and bought and sought outcome ids
   */
  userParticipatedCampaigns: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.userParticipatedCampaigns<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { userParticipatedCampaigns: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "userParticipatedCampaigns"
        >
    >
  >;
  /**
   * Returns total volume of user's all buy and sell actions
   */
  userTotalVolume: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.userTotalVolume<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { userTotalVolume: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "userTotalVolume"
        >
    >
  >;
  /**
   * Returns active positions acitvity history
   */
  positionsHistory: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.positionsHistory<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { positionsHistory: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "positionsHistory"
        >
    >
  >;
  /**
   * Return user's claim rewards details
   */
  userClaims: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.userClaims<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { userClaims: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "userClaims"
        >
    >
  >;

  userProfile: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.userProfile<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { userProfile: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "userProfile"
        >
    >
  >;
  /**
   * Returns user's staked liquidity to the markets
   */
  userLiquidity: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.userLiquidity<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { userLiquidity: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "userLiquidity"
        >
    >
  >;
  /**
   * Though the user should only ever create a referrer once, we should assume there might be
   * more, so we'll return more here, and let the frontend decide. Returns the codes.
   */
  referrersForAddress: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.referrersForAddress<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { referrersForAddress: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "referrersForAddress"
        >
    >
  >;
  /**
   * Leaderboards for this week.
   */
  leaderboards: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.leaderboards<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { leaderboards: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "leaderboards"
        >
    >
  >;
  /**
   * Get referrer address by its generated code.
   */
  referrerByCode: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.referrerByCode<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { referrerByCode: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "referrerByCode"
        >
    >
  >;
  /**
   * Aggregates recent trading activity and liquidity data per pool.
   * Combines liquidity changes, hourly volume, current liquidity, and buy/sell volume,
   * then ranks pools and returns recent shown buy/sell events with these metrics.
   */
  featuredCampaign: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.featuredCampaign<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { featuredCampaign: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "featuredCampaign"
        >
    >
  >;
  /**
   * Return users active liquidity staked to the campaigns
   */
  userLPs: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.userLPs<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { userLPs: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "userLPs"
        >
    >
  >;
  /**
   * Get the count of the referees
   */
  countReferees: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.countReferees<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { countReferees: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "countReferees"
        >
    >
  >;
  /**
   * Returns won campaigns profit according to share's total cost
   */
  userWonCampaignsProfits: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.userWonCampaignsProfits<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { userWonCampaignsProfits: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "userWonCampaignsProfits"
        >
    >
  >;
  /**
   * Gets comments of a campaign
   */
  campaignComments: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.campaignComments<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { campaignComments: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "campaignComments"
        >
    >
  >;
  /**
   * Get historical prices change events to create a price chart timeline
   */
  campaignPriceEvents: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.campaignPriceEvents<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { campaignPriceEvents: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "campaignPriceEvents"
        >
    >
  >;

  campaignWeeklyVolume: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.campaignWeeklyVolume<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { campaignWeeklyVolume: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "campaignWeeklyVolume"
        >
    >
  >;
  /**
   * Get the live campaign by token symbol for price prediction
   */
  campaignBySymbol: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.campaignBySymbol<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { campaignBySymbol: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "campaignBySymbol"
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
   * Post new comment to a campaign
   */
  postComment: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.postComment<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { postComment: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "postComment"
        >
    >
  >;
  /**
   * Delete a comment owned
   */
  deleteComment: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.deleteComment<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { deleteComment: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "deleteComment"
        >
    >
  >;
  /**
   * Request that the Paymaster service this request and deduct funds from the user's USDC
   * EOA using a Permit blob.
   */
  requestPaymaster: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.requestPaymaster<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { requestPaymaster: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "requestPaymaster"
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
      selectionSet: $$Utilities.Exact<
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
      selectionSet: $$Utilities.Exact<
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

  synchProfile: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.synchProfile<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { synchProfile: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "synchProfile"
        >
    >
  >;
  /**
   * Generate a referrer code, using the identifier that the user gave us.
   */
  genReferrer: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.genReferrer<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { genReferrer: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "genReferrer"
        >
    >
  >;
  /**
   * Sign that the database should recommend to your browser that you're entitled to a
   * referral. Reconstructs this:
   *
   * Referral(address sender,address referrer,uint256 deadline)
   */
  associateReferral: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.associateReferral<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { associateReferral: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "associateReferral"
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

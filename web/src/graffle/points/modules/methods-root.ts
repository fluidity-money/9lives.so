import type * as $$SelectionSets from "./selection-sets.js";
import type * as $$Schema from "./schema.js";
import type * as $$Utilities from "graffle/utilities-for-generated";

export interface QueryMethods<$Context extends $$Utilities.Context> {
  $batch: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
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
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            $$Utilities.AssertExtendsObject<$SelectionSet>,
            $$Schema.Schema<$Context["scalars"]>
          >
        >
    >
  >;
  __typename: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    () => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          { __typename: "Query" },
          "__typename"
        >
    >
  >;
  /**
   * Get points for the address given.
   */
  points: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.points<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            { points: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "points"
        >
    >
  >;
  /**
   * Leaderboard for everyone of points, sent in batches of 50. Also lets you request
   * information on the connected wallet's place in the leaderboard. If the user requested
   * their wallet, they're included as the last row if they weren't included in the results list
   * along with their place in the results.
   */
  leaderboard: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.leaderboard<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            { leaderboard: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "leaderboard"
        >
    >
  >;
  /**
   * Get achievements for the address given, or the category.
   * If the product is requested, then the count will be 0.
   */
  achievements: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.achievements<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            { achievements: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "achievements"
        >
    >
  >;
  /**
   * Gets a sorted ranking of the address * achievement count for a specific product.
   */
  leaderboards: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.leaderboards<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            { leaderboards: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "leaderboards"
        >
    >
  >;
  /**
   * Number of users who used this product.
   */
  productUserCount: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.productUserCount<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            { productUserCount: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "productUserCount"
        >
    >
  >;
  /**
   * Returns html string with embded points data for the wallet.
   * This is a common points component to be used in every products.
   */
  getPointsComponent: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet?: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.getPointsComponent<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            { getPointsComponent: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "getPointsComponent"
        >
    >
  >;
  /**
   * Get a user's address using their wallet address.
   */
  getAddressByDiscord: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.getAddressByDiscord<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            { getAddressByDiscord: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "getAddressByDiscord"
        >
    >
  >;
  /**
   * Return the address associated with a Discord handle.
   * Authenticated user only.
   */
  getDiscordName: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.getDiscordName<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            { getDiscordName: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "getDiscordName"
        >
    >
  >;
  /**
   * Get a leaderboard of the top holders of a token given.
   */
  getTokenLeaderboard: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.getTokenLeaderboard<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationQuery<
            { getTokenLeaderboard: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "getTokenLeaderboard"
        >
    >
  >;
}

export interface MutationMethods<$Context extends $$Utilities.Context> {
  $batch: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
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
          $$Utilities.DocumentBuilderKit.InferResult.OperationMutation<
            $$Utilities.AssertExtendsObject<$SelectionSet>,
            $$Schema.Schema<$Context["scalars"]>
          >
        >
    >
  >;
  __typename: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    () => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          { __typename: "Mutation" },
          "__typename"
        >
    >
  >;
  /**
   * Authenticate with the info service using the key given. Secret string that should be set
   * with Authorization.
   */
  auth: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.auth<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationMutation<
            { auth: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "auth"
        >
    >
  >;
  /**
   * Add achievement for an address or Discord handle given.
   */
  addAchievement: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.addAchievement<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationMutation<
            { addAchievement: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "addAchievement"
        >
    >
  >;
  /**
   * Register a Discord username with an address given. Does verification
   * to see if a trusted user is making this association.
   */
  registerDiscord: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.registerDiscord<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationMutation<
            { registerDiscord: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "registerDiscord"
        >
    >
  >;
  /**
   * Calculate points based on the data lake available. Does so using a function with an
   * advisory lock. Can only be used by an authenticated user sending a Authentication token.
   */
  calculatePoints: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.calculatePoints<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationMutation<
            { calculatePoints: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "calculatePoints"
        >
    >
  >;
  /**
   * Remove a campaign using special powers from the frontpage.
   */
  hideCampaign: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.hideCampaign<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationMutation<
            { hideCampaign: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "hideCampaign"
        >
    >
  >;
  /**
   * Adjust a campaign's categories based on its id.
   */
  setCampaignCategories: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.setCampaignCategories<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationMutation<
            { setCampaignCategories: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "setCampaignCategories"
        >
    >
  >;
  /**
   * Request tokens, but only for hackathons participants. Should be manually disabled in
   * the database if not taking place.
   */
  requestTokensHackathon: $$Utilities.GraffleKit.Context.Configuration.Check.Preflight<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.requestTokensHackathon<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputDocumentBuilderRootField<
          $Context,
          $$Utilities.DocumentBuilderKit.InferResult.OperationMutation<
            { requestTokensHackathon: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "requestTokensHackathon"
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

import * as $$SelectionSets from "./selection-sets.js";
import * as $$Schema from "./schema.js";
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
   * Get points for the address given.
   */
  points: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Query.points<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationQuery<
          { points: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "points"
      >
  >;
  /**
   * Get achievements for the address given, or the category.
   * If the product is requested, then the count will be 0.
   */
  achievements: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Query.achievements<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationQuery<
          { achievements: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "achievements"
      >
  >;
  /**
   * Gets a sorted ranking of the address * achievement count for a specific product.
   */
  leaderboards: <$SelectionSet>(
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
  >;
  /**
   * Number of users who used this product.
   */
  productUserCount: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Query.productUserCount<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationQuery<
          { productUserCount: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "productUserCount"
      >
  >;
  /**
   * Returns html string with embded points data for the wallet.
   * This is a common points component to be used in every products.
   */
  getPointsComponent: <$SelectionSet>(
    selectionSet?: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Query.getPointsComponent<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationQuery<
          { getPointsComponent: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "getPointsComponent"
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
   * Authenticate with the info service using the key given. Secret string that should be set
   * with Authorization.
   */
  auth: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Mutation.auth<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationMutation<
          { auth: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "auth"
      >
  >;
  /**
   * Add achievement for an address or Discord handle given.
   */
  addAchievement: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Mutation.addAchievement<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationMutation<
          { addAchievement: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "addAchievement"
      >
  >;
  /**
   * Register a Discord username with an address given. Does verification
   * to see if a trusted user is making this association.
   */
  registerDiscord: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Mutation.registerDiscord<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationMutation<
          { registerDiscord: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "registerDiscord"
      >
  >;
  /**
   * Calculate points based on the data lake available. Does so using a function with an
   * advisory lock. Can only be used by an authenticated user sending a Authentication token.
   */
  calculatePoints: <$SelectionSet>(
    selectionSet: $$Utilities.Exact<
      $SelectionSet,
      $$SelectionSets.Mutation.calculatePoints<$Context["scalars"]>
    >,
  ) => Promise<
    (null | {}) &
      $$Utilities.HandleOutputGraffleRootField<
        $Context,
        InferResult.OperationMutation<
          { calculatePoints: $SelectionSet },
          $$Schema.Schema<$Context["scalars"]>
        >,
        "calculatePoints"
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

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
   * Get the balance that can be spent after it was onramped.
   */
  balance: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.balance<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { balance: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "balance"
        >
    >
  >;
  /**
   * Currently outstanding auctions that need a user to submit BundleMakers.
   */
  openAuctions: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.openAuctions<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { openAuctions: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "openAuctions"
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
   * Create an account while onramping from bal to create a balance object.
   */
  createAccountExec: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.createAccountExec<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { createAccountExec: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "createAccountExec"
        >
    >
  >;
  /**
   * Onramp an amount using the router.
   */
  onrampAmount: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.onrampAmount<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { onrampAmount: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "onrampAmount"
        >
    >
  >;
  /**
   * Create an BundleTaker auction, and starting to receive BundleMaker combinations. Use the
   * server provided signature for an account that's managed by the server instead of
   * validating a signature and an amount.
   */
  createAuctionFromOnrampedAmountServerSig: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.createAuctionFromOnrampedAmountServerSig<
          $Context["scalars"]
        >
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { createAuctionFromOnrampedAmountServerSig: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "createAuctionFromOnrampedAmountServerSig"
        >
    >
  >;
  /**
   * Get status that's relevant for the submitter of the BundleTaker. The only caller is the
   * owner of the Bundle. Atomic in that the function that inspects information on this is
   * the acc_addr that we filter for.
   */
  inspectBundleTakerId: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.inspectBundleTakerId<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { inspectBundleTakerId: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "inspectBundleTakerId"
        >
    >
  >;
  /**
   * Permanently mark one side of the Aggregate bundle as consumed, and receive a server
   * signature for the Aggregate. Automatically decides if you're the taker or the maker,
   * and gives you results relevant to that.
   */
  concludeAndAggregate: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.concludeAndAggregate<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { concludeAndAggregate: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "concludeAndAggregate"
        >
    >
  >;
  /**
   * Cancel an auction, using the taker id to do so. Only possible to be invoked by the
   * creator of the auction. It's only possible to cancel the auction if it's within the
   * one minute window of the market existing.
   */
  cancelAuction: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.cancelAuction<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { cancelAuction: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "cancelAuction"
        >
    >
  >;
  /**
   * Submit a BundleMaker from the liquidity we have here using a server signature and an
   * onramped amount. The BundleMaker is not necessarily consumed unless it's chosen at
   * the end of the BundleTaker's life by the server or by the end user, depending on
   * the Taker's strategy for choosing. The BundleMaker here will take the opposite
   * position of the BundleTaker.
   */
  submitBundleMakerFromOnrampedAmountServerSig: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.submitBundleMakerFromOnrampedAmountServerSig<
          $Context["scalars"]
        >
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { submitBundleMakerFromOnrampedAmountServerSig: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "submitBundleMakerFromOnrampedAmountServerSig"
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

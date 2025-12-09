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
   * Get the system management ed25519 public key this server is managing. Useful for the
   * signing process.
   */
  publickey: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet?: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.publickey<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { publickey: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "publickey"
        >
    >
  >;

  eoaForAddress: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.eoaForAddress<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { eoaForAddress: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "eoaForAddress"
        >
    >
  >;
  /**
   * Is this address recorded as having onramped?
   */
  hasCreated: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Query.hasCreated<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationQuery<
            { hasCreated: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "hasCreated"
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
   * Create a new account using the key management service intended for API workers. Returns
   * a secret key that can be used to spend from the account.
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
   * Request the existing secret that was created for this account. It needs a signature of
   * the nonce and the public key from the user. The nonce must be greater than what's
   * recorded in the database so far.
   */
  requestSecret: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.requestSecret<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { requestSecret: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "requestSecret"
        >
    >
  >;
  /**
   * Use 9lives to open a position on behalf of the user given, optiomally creating the
   * account at the same time. The EOA is fetched from the secret key that the
   * user passes to the client.
   */
  ninelivesMint: $$Utilities.ClientTransports.PreflightCheck<
    $Context,
    <$SelectionSet>(
      selectionSet: $$Utilities.Exact<
        $SelectionSet,
        $$SelectionSets.Mutation.ninelivesMint<$Context["scalars"]>
      >,
    ) => Promise<
      (null | {}) &
        $$Utilities.HandleOutputGraffleRootField<
          $Context,
          InferResult.OperationMutation<
            { ninelivesMint: $SelectionSet },
            $$Schema.Schema<$Context["scalars"]>
          >,
          "ninelivesMint"
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

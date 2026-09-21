import type { Select as $Select } from "graffle/schema";
import type * as $$Utilities from "graffle/utilities-for-generated";

//
//
//
//
//
//
// ==================================================================================================
//                                              Document
// ==================================================================================================
//
//
//
//
//
//

export interface $Document<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
> {
  query?: Record<string, Query<_$Scalars>>;
  mutation?: Record<string, Mutation<_$Scalars>>;
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

//                                               Query
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Query<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
> {
  /**
   *
   * Select the `balance` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  balance?:
    | Query.balance<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.balance<_$Scalars>>;
  /**
   *
   * Select the `openAuctions` field on the `Query` object. Its type is `OpenAuctions` (a `OutputObject` kind of type).
   *
   */
  openAuctions?:
    | Query.openAuctions$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.openAuctions<_$Scalars>>;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?: Query$FragmentInline<_$Scalars> | Query$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface Query$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends Query<_$Scalars>, $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Query {
  export type balance<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = balance$SelectionSet<_$Scalars>;

  export interface balance$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {
    /**
     * Arguments for `balance` field. All arguments are required so you must include this.
     */
    $: balance$Arguments<_$Scalars>;
  }

  export interface balance$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    addr: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `balance` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type balance$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<balance$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type openAuctions<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = openAuctions$SelectionSet<_$Scalars>;

  export interface openAuctions$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base, $NamedTypes.$OpenAuctions<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `openAuctions` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type openAuctions$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<openAuctions$SelectionSet<_$Scalars>>;
}

//                                              Mutation
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Mutation<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
> {
  /**
   *
   * Select the `createAccountExec` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  createAccountExec?:
    | Mutation.createAccountExec<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.createAccountExec<_$Scalars>>;
  /**
   *
   * Select the `onrampAmount` field on the `Mutation` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  onrampAmount?:
    | Mutation.onrampAmount<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.onrampAmount<_$Scalars>>;
  /**
   *
   * Select the `createAuctionFromOnrampedAmountServerSig` field on the `Mutation` object. Its type is `AuctionCreatedResult` (a `OutputObject` kind of type).
   *
   */
  createAuctionFromOnrampedAmountServerSig?:
    | Mutation.createAuctionFromOnrampedAmountServerSig<_$Scalars>
    | $Select.SelectAlias.SelectAlias<
        Mutation.createAuctionFromOnrampedAmountServerSig<_$Scalars>
      >;
  /**
   *
   * Select the `inspectBundleTakerId` field on the `Mutation` object. Its type is `BundleTakerOwnerStatus` (a `OutputObject` kind of type).
   *
   */
  inspectBundleTakerId?:
    | Mutation.inspectBundleTakerId<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.inspectBundleTakerId<_$Scalars>>;
  /**
   *
   * Select the `concludeAndAggregate` field on the `Mutation` object. Its type is `Aggregate` (a `OutputObject` kind of type).
   *
   */
  concludeAndAggregate?:
    | Mutation.concludeAndAggregate<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.concludeAndAggregate<_$Scalars>>;
  /**
   *
   * Select the `cancelAuction` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  cancelAuction?:
    | Mutation.cancelAuction<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.cancelAuction<_$Scalars>>;
  /**
   *
   * Select the `submitBundleMakerFromOnrampedAmountServerSig` field on the `Mutation` object. Its type is `BundleMakerInfo` (a `OutputObject` kind of type).
   *
   */
  submitBundleMakerFromOnrampedAmountServerSig?:
    | Mutation.submitBundleMakerFromOnrampedAmountServerSig<_$Scalars>
    | $Select.SelectAlias.SelectAlias<
        Mutation.submitBundleMakerFromOnrampedAmountServerSig<_$Scalars>
      >;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?:
    | Mutation$FragmentInline<_$Scalars>
    | Mutation$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface Mutation$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    Mutation<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Mutation {
  export type createAccountExec<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = createAccountExec$SelectionSet<_$Scalars>;

  export interface createAccountExec$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {
    /**
     * Arguments for `createAccountExec` field. Some (2/4) arguments are required so you must include this.
     */
    $: createAccountExec$Arguments<_$Scalars>;
  }

  export interface createAccountExec$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    createAccount: $NamedTypes.$CreateAccount<_$Scalars>;
    permit?: $NamedTypes.$Permit<_$Scalars> | undefined | null;
    amt: string;
    isDryrun?: boolean | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `createAccountExec` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type createAccountExec$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<createAccountExec$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type onrampAmount<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = onrampAmount$SelectionSet<_$Scalars>;

  export interface onrampAmount$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {
    /**
     * Arguments for `onrampAmount` field. Some (1/3) arguments are required so you must include this.
     */
    $: onrampAmount$Arguments<_$Scalars>;
  }

  export interface onrampAmount$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    amt: string;
    permit?: $NamedTypes.$Permit<_$Scalars> | undefined | null;
    isDryrun?: boolean | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `onrampAmount` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type onrampAmount$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<onrampAmount$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type createAuctionFromOnrampedAmountServerSig<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = createAuctionFromOnrampedAmountServerSig$SelectionSet<_$Scalars>;

  export interface createAuctionFromOnrampedAmountServerSig$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base, $NamedTypes.$AuctionCreatedResult<_$Scalars> {
    /**
     * Arguments for `createAuctionFromOnrampedAmountServerSig` field. All arguments are required so you must include this.
     */
    $: createAuctionFromOnrampedAmountServerSig$Arguments<_$Scalars>;
  }

  export interface createAuctionFromOnrampedAmountServerSig$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * The minimum amount of the outstanding balance we can spend here.
     */
    minAmount: string;
    /**
     * "
     * The maximum amount to take from the available onramped liquidity.
     */
    maxAmount: string;
    isUp: boolean;
    priceTarget: string;
    $outcome: $NamedTypes.$Outcome;
    /**
     * The timestamp that we use for expiry of the market.
     */
    expiry: number;
    /**
     * Deadline for any offers coming in. Orders can only be placed before this ends.
     */
    deadline: number;
    /**
     * Minimum offer of amount to take from the Maker in exchange for this liquidity.
     */
    minOffer: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `createAuctionFromOnrampedAmountServerSig` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type createAuctionFromOnrampedAmountServerSig$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    createAuctionFromOnrampedAmountServerSig$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type inspectBundleTakerId<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = inspectBundleTakerId$SelectionSet<_$Scalars>;

  export interface inspectBundleTakerId$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base, $NamedTypes.$BundleTakerOwnerStatus<_$Scalars> {
    /**
     * Arguments for `inspectBundleTakerId` field. All arguments are required so you must include this.
     */
    $: inspectBundleTakerId$Arguments<_$Scalars>;
  }

  export interface inspectBundleTakerId$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    bundleTakerId: number;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `inspectBundleTakerId` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type inspectBundleTakerId$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<inspectBundleTakerId$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type concludeAndAggregate<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = concludeAndAggregate$SelectionSet<_$Scalars>;

  export interface concludeAndAggregate$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base, $NamedTypes.$Aggregate<_$Scalars> {
    /**
     * Arguments for `concludeAndAggregate` field. All arguments are required so you must include this.
     */
    $: concludeAndAggregate$Arguments<_$Scalars>;
  }

  export interface concludeAndAggregate$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    bundleTakerId: number;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `concludeAndAggregate` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type concludeAndAggregate$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<concludeAndAggregate$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type cancelAuction<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = cancelAuction$SelectionSet<_$Scalars>;

  export interface cancelAuction$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {
    /**
     * Arguments for `cancelAuction` field. All arguments are required so you must include this.
     */
    $: cancelAuction$Arguments<_$Scalars>;
  }

  export interface cancelAuction$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    bundleTakerId: number;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `cancelAuction` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type cancelAuction$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<cancelAuction$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type submitBundleMakerFromOnrampedAmountServerSig<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = submitBundleMakerFromOnrampedAmountServerSig$SelectionSet<_$Scalars>;

  export interface submitBundleMakerFromOnrampedAmountServerSig$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base, $NamedTypes.$BundleMakerInfo<_$Scalars> {
    /**
     * Arguments for `submitBundleMakerFromOnrampedAmountServerSig` field. All arguments are required so you must include this.
     */
    $: submitBundleMakerFromOnrampedAmountServerSig$Arguments<_$Scalars>;
  }

  export interface submitBundleMakerFromOnrampedAmountServerSig$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * The bundle taker to point to to make this interaction work.
     */
    bundleTakerId: number;
    /**
     * The minimum amount of the outstanding balance we can spend here.
     */
    minAmount: string;
    /**
     * "
     * The maximum amount to take from the available onramped liquidity.
     */
    maxAmount: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `submitBundleMakerFromOnrampedAmountServerSig` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type submitBundleMakerFromOnrampedAmountServerSig$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    submitBundleMakerFromOnrampedAmountServerSig$SelectionSet<_$Scalars>
  >;
}

//
//
//
//
//
//
// ==================================================================================================
//                                                Enum
// ==================================================================================================
//
//
//
//
//
//

export type Outcome = "BitcoinPrice";

//
//
//
//
//
//
// ==================================================================================================
//                                            InputObject
// ==================================================================================================
//
//
//
//
//
//

export interface CreateAccount<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
> {
  eoa_addr: string;
  sigV: number;
  sigR: string;
  sigS: string;
  authority?: string | undefined | null;
}

export interface Permit<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
> {
  deadline: number;
  permitV: number;
  permitR: string;
  permitS: string;
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

//                                            OpenAuction
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface OpenAuction<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `OpenAuction` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | OpenAuction.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuction.id<_$Scalars>>;
  /**
   *
   * Select the `openToBeWon` field on the `OpenAuction` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  openToBeWon?:
    | OpenAuction.openToBeWon$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuction.openToBeWon<_$Scalars>>;
  /**
   *
   * Select the `accAddr` field on the `OpenAuction` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  accAddr?:
    | OpenAuction.accAddr$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuction.accAddr<_$Scalars>>;
  /**
   *
   * Select the `deadlineTs` field on the `OpenAuction` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  deadlineTs?:
    | OpenAuction.deadlineTs$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuction.deadlineTs<_$Scalars>>;
  /**
   *
   * Select the `outcome` field on the `OpenAuction` object. Its type is `Outcome` (a `Enum` kind of type).
   *
   */
  outcome?:
    | OpenAuction.outcome$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuction.outcome<_$Scalars>>;
  /**
   *
   * Select the `expiryTs` field on the `OpenAuction` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  expiryTs?:
    | OpenAuction.expiryTs$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuction.expiryTs<_$Scalars>>;
  /**
   *
   * Select the `priceTarget` field on the `OpenAuction` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  priceTarget?:
    | OpenAuction.priceTarget$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuction.priceTarget<_$Scalars>>;
  /**
   *
   * Select the `isUp` field on the `OpenAuction` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  isUp?:
    | OpenAuction.isUp$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuction.isUp<_$Scalars>>;
  /**
   *
   * Select the `bundleTakerId` field on the `OpenAuction` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  bundleTakerId?:
    | OpenAuction.bundleTakerId$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuction.bundleTakerId<_$Scalars>>;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?:
    | OpenAuction$FragmentInline<_$Scalars>
    | OpenAuction$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface OpenAuction$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    OpenAuction<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace OpenAuction {
  export type id<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>;

  export interface id$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `id` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type id$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type openToBeWon<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | openToBeWon$SelectionSet<_$Scalars>;

  export interface openToBeWon$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `openToBeWon` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type openToBeWon$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | openToBeWon$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type accAddr<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | accAddr$SelectionSet<_$Scalars>;

  export interface accAddr$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `accAddr` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type accAddr$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | accAddr$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type deadlineTs<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | deadlineTs$SelectionSet<_$Scalars>;

  export interface deadlineTs$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `deadlineTs` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type deadlineTs$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | deadlineTs$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type outcome<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | outcome$SelectionSet<_$Scalars>;

  export interface outcome$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `outcome` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type outcome$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | outcome$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type expiryTs<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | expiryTs$SelectionSet<_$Scalars>;

  export interface expiryTs$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `expiryTs` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type expiryTs$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | expiryTs$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type priceTarget<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | priceTarget$SelectionSet<_$Scalars>;

  export interface priceTarget$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `priceTarget` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type priceTarget$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | priceTarget$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type isUp<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | isUp$SelectionSet<_$Scalars>;

  export interface isUp$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `isUp` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type isUp$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | isUp$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type bundleTakerId<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | bundleTakerId$SelectionSet<_$Scalars>;

  export interface bundleTakerId$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `bundleTakerId` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type bundleTakerId$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | bundleTakerId$SelectionSet<_$Scalars>
  >;
}

//                                            OpenAuctions
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface OpenAuctions<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `OpenAuctions` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | OpenAuctions.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuctions.id<_$Scalars>>;
  /**
   *
   * Select the `openAuctions` field on the `OpenAuctions` object. Its type is `OpenAuction` (a `OutputObject` kind of type).
   *
   */
  openAuctions?:
    | OpenAuctions.openAuctions$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<OpenAuctions.openAuctions<_$Scalars>>;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?:
    | OpenAuctions$FragmentInline<_$Scalars>
    | OpenAuctions$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface OpenAuctions$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    OpenAuctions<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace OpenAuctions {
  export type id<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>;

  export interface id$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `id` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type id$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type openAuctions<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = openAuctions$SelectionSet<_$Scalars>;

  export interface openAuctions$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base, $NamedTypes.$OpenAuction<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `openAuctions` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type openAuctions$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<openAuctions$SelectionSet<_$Scalars>>;
}

//                                        AuctionCreatedResult
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface AuctionCreatedResult<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `leftoverBal` field on the `AuctionCreatedResult` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  leftoverBal?:
    | AuctionCreatedResult.leftoverBal$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<
        AuctionCreatedResult.leftoverBal<_$Scalars>
      >;
  /**
   *
   * Select the `amountSpent` field on the `AuctionCreatedResult` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  amountSpent?:
    | AuctionCreatedResult.amountSpent$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<
        AuctionCreatedResult.amountSpent<_$Scalars>
      >;
  /**
   *
   * Select the `bundleId` field on the `AuctionCreatedResult` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  bundleId?:
    | AuctionCreatedResult.bundleId$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<AuctionCreatedResult.bundleId<_$Scalars>>;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?:
    | AuctionCreatedResult$FragmentInline<_$Scalars>
    | AuctionCreatedResult$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface AuctionCreatedResult$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    AuctionCreatedResult<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace AuctionCreatedResult {
  export type leftoverBal<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | leftoverBal$SelectionSet<_$Scalars>;

  export interface leftoverBal$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `leftoverBal` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type leftoverBal$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | leftoverBal$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type amountSpent<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | amountSpent$SelectionSet<_$Scalars>;

  export interface amountSpent$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `amountSpent` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type amountSpent$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | amountSpent$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type bundleId<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | bundleId$SelectionSet<_$Scalars>;

  export interface bundleId$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `bundleId` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type bundleId$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | bundleId$SelectionSet<_$Scalars>
  >;
}

//                                          BundleMakerInfo
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface BundleMakerInfo<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `BundleMakerInfo` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | BundleMakerInfo.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<BundleMakerInfo.id<_$Scalars>>;
  /**
   *
   * Select the `bundleMakerId` field on the `BundleMakerInfo` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  bundleMakerId?:
    | BundleMakerInfo.bundleMakerId$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<BundleMakerInfo.bundleMakerId<_$Scalars>>;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?:
    | BundleMakerInfo$FragmentInline<_$Scalars>
    | BundleMakerInfo$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface BundleMakerInfo$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    BundleMakerInfo<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace BundleMakerInfo {
  export type id<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>;

  export interface id$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `id` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type id$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type bundleMakerId<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | bundleMakerId$SelectionSet<_$Scalars>;

  export interface bundleMakerId$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `bundleMakerId` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type bundleMakerId$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | bundleMakerId$SelectionSet<_$Scalars>
  >;
}

//                                       BundleTakerOwnerStatus
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface BundleTakerOwnerStatus<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `BundleTakerOwnerStatus` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | BundleTakerOwnerStatus.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<BundleTakerOwnerStatus.id<_$Scalars>>;
  /**
   *
   * Select the `concluded` field on the `BundleTakerOwnerStatus` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  concluded?:
    | BundleTakerOwnerStatus.concluded$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<
        BundleTakerOwnerStatus.concluded<_$Scalars>
      >;
  /**
   *
   * Select the `cancelled` field on the `BundleTakerOwnerStatus` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  cancelled?:
    | BundleTakerOwnerStatus.cancelled$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<
        BundleTakerOwnerStatus.cancelled<_$Scalars>
      >;
  /**
   *
   * Select the `earned` field on the `BundleTakerOwnerStatus` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  earned?:
    | BundleTakerOwnerStatus.earned$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<BundleTakerOwnerStatus.earned<_$Scalars>>;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?:
    | BundleTakerOwnerStatus$FragmentInline<_$Scalars>
    | BundleTakerOwnerStatus$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface BundleTakerOwnerStatus$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    BundleTakerOwnerStatus<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace BundleTakerOwnerStatus {
  export type id<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>;

  export interface id$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `id` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type id$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type concluded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | concluded$SelectionSet<_$Scalars>;

  export interface concluded$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `concluded` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type concluded$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | concluded$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type cancelled<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | cancelled$SelectionSet<_$Scalars>;

  export interface cancelled$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `cancelled` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type cancelled$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | cancelled$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type earned<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | earned$SelectionSet<_$Scalars>;

  export interface earned$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `earned` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type earned$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | earned$SelectionSet<_$Scalars>
  >;
}

//                                        AggregateBundleTaker
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface AggregateBundleTaker<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `AggregateBundleTaker` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | AggregateBundleTaker.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<AggregateBundleTaker.id<_$Scalars>>;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?:
    | AggregateBundleTaker$FragmentInline<_$Scalars>
    | AggregateBundleTaker$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface AggregateBundleTaker$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    AggregateBundleTaker<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace AggregateBundleTaker {
  export type id<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>;

  export interface id$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `id` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type id$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>
  >;
}

//                                        AggregateBundleMaker
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface AggregateBundleMaker<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `AggregateBundleMaker` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | AggregateBundleMaker.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<AggregateBundleMaker.id<_$Scalars>>;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?:
    | AggregateBundleMaker$FragmentInline<_$Scalars>
    | AggregateBundleMaker$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface AggregateBundleMaker$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    AggregateBundleMaker<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace AggregateBundleMaker {
  export type id<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>;

  export interface id$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `id` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type id$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>
  >;
}

//                                             Aggregate
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Aggregate<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `Aggregate` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | Aggregate.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Aggregate.id<_$Scalars>>;
  /**
   *
   * Select the `takerWon` field on the `Aggregate` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  takerWon?:
    | Aggregate.takerWon$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Aggregate.takerWon<_$Scalars>>;
  /**
   *
   * Select the `bundleTaker` field on the `Aggregate` object. Its type is `AggregateBundleTaker` (a `OutputObject` kind of type).
   *
   */
  bundleTaker?:
    | Aggregate.bundleTaker$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Aggregate.bundleTaker<_$Scalars>>;
  /**
   *
   * Select the `bundleMaker` field on the `Aggregate` object. Its type is `AggregateBundleMaker` (a `OutputObject` kind of type).
   *
   */
  bundleMaker?:
    | Aggregate.bundleMaker$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Aggregate.bundleMaker<_$Scalars>>;

  /**
   *
   * Inline fragments for field groups.
   *
   * Generally a niche feature. This can be useful for example to apply an `@include` directive to a subset of the
   * selection set in turn allowing you to pass a variable to opt in/out of that selection during execution on the server.
   *
   * @see https://spec.graphql.org/draft/#sec-Inline-Fragments
   *
   */
  ___?:
    | Aggregate$FragmentInline<_$Scalars>
    | Aggregate$FragmentInline<_$Scalars>[];

  /**
   *
   * A meta field. Is the name of the type being selected.
   *
   * @see https://graphql.org/learn/queries/#meta-fields
   *
   */
  __typename?:
    | $Select.Indicator.NoArgsIndicator$Expanded
    | $Select.SelectAlias.SelectAlias<$Select.Indicator.NoArgsIndicator>;
}

export interface Aggregate$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    Aggregate<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Aggregate {
  export type id<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>;

  export interface id$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `id` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type id$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type takerWon<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | takerWon$SelectionSet<_$Scalars>;

  export interface takerWon$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `takerWon` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type takerWon$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | takerWon$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type bundleTaker<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = bundleTaker$SelectionSet<_$Scalars>;

  export interface bundleTaker$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base, $NamedTypes.$AggregateBundleTaker<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `bundleTaker` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type bundleTaker$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<bundleTaker$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type bundleMaker<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = bundleMaker$SelectionSet<_$Scalars>;

  export interface bundleMaker$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base, $NamedTypes.$AggregateBundleMaker<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `bundleMaker` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type bundleMaker$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<bundleMaker$SelectionSet<_$Scalars>>;
}

/**
 * [1] These definitions serve to allow field selection interfaces to extend their respective object type without
 *     name clashing between the field name and the object name.
 *
 *     For example imagine `Query.Foo` field with type also called `Foo`. Our generated interfaces for each field
 *     would end up with an error of `export interface Foo extends Foo ...`
 */
export namespace $NamedTypes {
  export type $Query<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = Query<_$Scalars>;
  export type $Mutation<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = Mutation<_$Scalars>;
  export type $Outcome = Outcome;
  export type $CreateAccount<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = CreateAccount<_$Scalars>;
  export type $Permit<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = Permit<_$Scalars>;
  export type $OpenAuction<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = OpenAuction<_$Scalars>;
  export type $OpenAuctions<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = OpenAuctions<_$Scalars>;
  export type $AuctionCreatedResult<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = AuctionCreatedResult<_$Scalars>;
  export type $BundleMakerInfo<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = BundleMakerInfo<_$Scalars>;
  export type $BundleTakerOwnerStatus<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = BundleTakerOwnerStatus<_$Scalars>;
  export type $AggregateBundleTaker<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = AggregateBundleTaker<_$Scalars>;
  export type $AggregateBundleMaker<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = AggregateBundleMaker<_$Scalars>;
  export type $Aggregate<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = Aggregate<_$Scalars>;
}

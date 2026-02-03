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
   * Select the `publickey` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  publickey?:
    | Query.publickey$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.publickey<_$Scalars>>;
  /**
   *
   * Select the `eoaForAddress` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  eoaForAddress?:
    | Query.eoaForAddress<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.eoaForAddress<_$Scalars>>;
  /**
   *
   * Select the `hasCreated` field on the `Query` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  hasCreated?:
    | Query.hasCreated<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.hasCreated<_$Scalars>>;
  /**
   *
   * Select the `statistics` field on the `Query` object. Its type is `Statistics` (a `OutputObject` kind of type).
   *
   */
  statistics?:
    | Query.statistics$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.statistics<_$Scalars>>;

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
  export type publickey<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | publickey$SelectionSet<_$Scalars>;

  export interface publickey$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `publickey` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type publickey$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | publickey$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type eoaForAddress<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = eoaForAddress$SelectionSet<_$Scalars>;

  export interface eoaForAddress$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {
    /**
     * Arguments for `eoaForAddress` field. All arguments are required so you must include this.
     */
    $: eoaForAddress$Arguments<_$Scalars>;
  }

  export interface eoaForAddress$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `eoaForAddress` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type eoaForAddress$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<eoaForAddress$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type hasCreated<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = hasCreated$SelectionSet<_$Scalars>;

  export interface hasCreated$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {
    /**
     * Arguments for `hasCreated` field. All arguments are required so you must include this.
     */
    $: hasCreated$Arguments<_$Scalars>;
  }

  export interface hasCreated$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `hasCreated` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type hasCreated$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<hasCreated$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type statistics<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = statistics$SelectionSet<_$Scalars>;

  export interface statistics$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base, $NamedTypes.$Statistics<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `statistics` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type statistics$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<statistics$SelectionSet<_$Scalars>>;
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
   * Select the `createAccountExec` field on the `Mutation` object. Its type is `CreateAccountExec` (a `OutputObject` kind of type).
   *
   */
  createAccountExec?:
    | Mutation.createAccountExec<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.createAccountExec<_$Scalars>>;
  /**
   *
   * Select the `requestSecret` field on the `Mutation` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  requestSecret?:
    | Mutation.requestSecret<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.requestSecret<_$Scalars>>;
  /**
   *
   * Select the `ninelivesMint` field on the `Mutation` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  ninelivesMint?:
    | Mutation.ninelivesMint<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.ninelivesMint<_$Scalars>>;
  /**
   *
   * Select the `claimRewards` field on the `Mutation` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  claimRewards?:
    | Mutation.claimRewards<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.claimRewards<_$Scalars>>;

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
    extends $Select.Bases.Base, $NamedTypes.$CreateAccountExec<_$Scalars> {
    /**
     * Arguments for `createAccountExec` field. Some (1/3) arguments are required so you must include this.
     */
    $: createAccountExec$Arguments<_$Scalars>;
  }

  export interface createAccountExec$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    createAccount: $NamedTypes.$CreateAccount<_$Scalars>;
    mint?: $NamedTypes.$Mint<_$Scalars> | undefined | null;
    dryrun?: boolean | undefined | null;
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

  export type requestSecret<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = requestSecret$SelectionSet<_$Scalars>;

  export interface requestSecret$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {
    /**
     * Arguments for `requestSecret` field. Some (5/6) arguments are required so you must include this.
     */
    $: requestSecret$Arguments<_$Scalars>;
  }

  export interface requestSecret$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    eoa_addr: string;
    nonce: number;
    sigV: number;
    sigR: string;
    sigS: string;
    dryrun?: boolean | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `requestSecret` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type requestSecret$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<requestSecret$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type ninelivesMint<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = ninelivesMint$SelectionSet<_$Scalars>;

  export interface ninelivesMint$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {
    /**
     * Arguments for `ninelivesMint` field. Some (1/2) arguments are required so you must include this.
     */
    $: ninelivesMint$Arguments<_$Scalars>;
  }

  export interface ninelivesMint$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    mint: $NamedTypes.$Mint<_$Scalars>;
    dryrun?: boolean | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `ninelivesMint` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type ninelivesMint$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<ninelivesMint$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type claimRewards<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = claimRewards$SelectionSet<_$Scalars>;

  export interface claimRewards$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {
    /**
     * Arguments for `claimRewards` field. Some (2/3) arguments are required so you must include this.
     */
    $: claimRewards$Arguments<_$Scalars>;
  }

  export interface claimRewards$Arguments<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    markets: Array<string | undefined | null>;
    msTs: string;
    dryrun?: boolean | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `claimRewards` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type claimRewards$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<claimRewards$SelectionSet<_$Scalars>>;
}

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

export interface FromArgs<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
> {
  token: string;
  to_take: string;
  max_unspent: string;
}

export interface Mint<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
> {
  market: string;
  outcome: string;
  amount: string;
  permit?: $NamedTypes.$Permit<_$Scalars> | undefined | null;
  referrer: string;
  /**
   * The millisecond timestamp for making sure this isn't doubled up somehow.
   */
  ms_ts: string;
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

export interface SolveArgs<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
> {
  permit: Array<$NamedTypes.$Permit<_$Scalars> | undefined | null>;
  from: Array<$NamedTypes.$FromArgs<_$Scalars> | undefined | null>;
  target: string;
  cd: string;
  ms_ts: string;
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

//                                         CreateAccountExec
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface CreateAccountExec<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `hash` field on the `CreateAccountExec` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  hash?:
    | CreateAccountExec.hash$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<CreateAccountExec.hash<_$Scalars>>;
  /**
   *
   * Select the `secret` field on the `CreateAccountExec` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  secret?:
    | CreateAccountExec.secret$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<CreateAccountExec.secret<_$Scalars>>;

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
    | CreateAccountExec$FragmentInline<_$Scalars>
    | CreateAccountExec$FragmentInline<_$Scalars>[];

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

export interface CreateAccountExec$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    CreateAccountExec<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace CreateAccountExec {
  export type hash<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | hash$SelectionSet<_$Scalars>;

  export interface hash$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `hash` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type hash$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | hash$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type secret<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | secret$SelectionSet<_$Scalars>;

  export interface secret$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `secret` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type secret$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | secret$SelectionSet<_$Scalars>
  >;
}

//                                             Statistics
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Statistics for this usage type. Only since 1768801591.
 */
export interface Statistics<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `action` field on the `Statistics` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  action?:
    | Statistics.action$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Statistics.action<_$Scalars>>;
  /**
   *
   * Select the `avgGasLimit24Hours` field on the `Statistics` object. Its type is `Float` (a `ScalarStandard` kind of type).
   *
   */
  avgGasLimit24Hours?:
    | Statistics.avgGasLimit24Hours$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Statistics.avgGasLimit24Hours<_$Scalars>>;
  /**
   *
   * Select the `avgGasLimitWeek` field on the `Statistics` object. Its type is `Float` (a `ScalarStandard` kind of type).
   *
   */
  avgGasLimitWeek?:
    | Statistics.avgGasLimitWeek$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Statistics.avgGasLimitWeek<_$Scalars>>;
  /**
   *
   * Select the `avgGasLimitAllTime` field on the `Statistics` object. Its type is `Float` (a `ScalarStandard` kind of type).
   *
   */
  avgGasLimitAllTime?:
    | Statistics.avgGasLimitAllTime$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Statistics.avgGasLimitAllTime<_$Scalars>>;
  /**
   *
   * Select the `tx24Hours` field on the `Statistics` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  tx24Hours?:
    | Statistics.tx24Hours$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Statistics.tx24Hours<_$Scalars>>;
  /**
   *
   * Select the `txWeek` field on the `Statistics` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  txWeek?:
    | Statistics.txWeek$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Statistics.txWeek<_$Scalars>>;
  /**
   *
   * Select the `txAllTime` field on the `Statistics` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  txAllTime?:
    | Statistics.txAllTime$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Statistics.txAllTime<_$Scalars>>;

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
    | Statistics$FragmentInline<_$Scalars>
    | Statistics$FragmentInline<_$Scalars>[];

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

export interface Statistics$FragmentInline<
  _$Scalars extends $$Utilities.Schema.Scalar.Registry =
    $$Utilities.Schema.Scalar.Registry.Empty,
>
  extends
    Statistics<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Statistics {
  export type action<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | action$SelectionSet<_$Scalars>;

  export interface action$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `action` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type action$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | action$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type avgGasLimit24Hours<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | avgGasLimit24Hours$SelectionSet<_$Scalars>;

  export interface avgGasLimit24Hours$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `avgGasLimit24Hours` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type avgGasLimit24Hours$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    | $Select.Indicator.NoArgsIndicator
    | avgGasLimit24Hours$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type avgGasLimitWeek<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | avgGasLimitWeek$SelectionSet<_$Scalars>;

  export interface avgGasLimitWeek$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `avgGasLimitWeek` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type avgGasLimitWeek$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | avgGasLimitWeek$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type avgGasLimitAllTime<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | avgGasLimitAllTime$SelectionSet<_$Scalars>;

  export interface avgGasLimitAllTime$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `avgGasLimitAllTime` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type avgGasLimitAllTime$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    | $Select.Indicator.NoArgsIndicator
    | avgGasLimitAllTime$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type tx24Hours<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | tx24Hours$SelectionSet<_$Scalars>;

  export interface tx24Hours$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `tx24Hours` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type tx24Hours$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | tx24Hours$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type txWeek<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | txWeek$SelectionSet<_$Scalars>;

  export interface txWeek$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `txWeek` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type txWeek$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | txWeek$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type txAllTime<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | txAllTime$SelectionSet<_$Scalars>;

  export interface txAllTime$SelectionSet<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  >
    extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `txAllTime` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type txAllTime$Expanded<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | txAllTime$SelectionSet<_$Scalars>
  >;
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
  export type $CreateAccount<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = CreateAccount<_$Scalars>;
  export type $FromArgs<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = FromArgs<_$Scalars>;
  export type $Mint<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = Mint<_$Scalars>;
  export type $Permit<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = Permit<_$Scalars>;
  export type $SolveArgs<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = SolveArgs<_$Scalars>;
  export type $CreateAccountExec<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = CreateAccountExec<_$Scalars>;
  export type $Statistics<
    _$Scalars extends $$Utilities.Schema.Scalar.Registry =
      $$Utilities.Schema.Scalar.Registry.Empty,
  > = Statistics<_$Scalars>;
}

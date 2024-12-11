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
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
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
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> {
  /**
   *
   * Select the `campaigns` field on the `Query` object. Its type is `Campaign` (a `OutputObject` kind of type).
   *
   */
  campaigns?:
    | Query.campaigns$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.campaigns<_$Scalars>>;
  /**
   *
   * Select the `frontpage` field on the `Query` object. Its type is `Frontpage` (a `OutputObject` kind of type).
   *
   */
  frontpage?:
    | Query.frontpage$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.frontpage<_$Scalars>>;
  /**
   *
   * Select the `suggestedHeadlines` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  suggestedHeadlines?:
    | Query.suggestedHeadlines$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.suggestedHeadlines<_$Scalars>>;
  /**
   *
   * Select the `changelog` field on the `Query` object. Its type is `Changelog` (a `OutputObject` kind of type).
   *
   */
  changelog?:
    | Query.changelog$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.changelog<_$Scalars>>;

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
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Query<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Query {
  export type campaigns<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = campaigns$SelectionSet<_$Scalars>;

  export interface campaigns$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Campaign<_$Scalars> {
    /**
     * Arguments for `campaigns` field. No arguments are required so you may omit this.
     */
    $?: campaigns$Arguments<_$Scalars>;
  }

  export interface campaigns$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    category?: Array<string | undefined | null> | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaigns` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaigns$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<campaigns$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type frontpage<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = frontpage$SelectionSet<_$Scalars>;

  export interface frontpage$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Frontpage<_$Scalars> {
    /**
     * Arguments for `frontpage` field. No arguments are required so you may omit this.
     */
    $?: frontpage$Arguments<_$Scalars>;
  }

  export interface frontpage$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    category?: Array<string | undefined | null> | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `frontpage` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type frontpage$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<frontpage$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type suggestedHeadlines<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | suggestedHeadlines$SelectionSet<_$Scalars>;

  export interface suggestedHeadlines$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `suggestedHeadlines` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type suggestedHeadlines$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    | $Select.Indicator.NoArgsIndicator
    | suggestedHeadlines$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type changelog<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = changelog$SelectionSet<_$Scalars>;

  export interface changelog$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Changelog<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `changelog` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type changelog$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<changelog$SelectionSet<_$Scalars>>;
}

//                                              Mutation
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Mutation<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> {
  /**
   *
   * Select the `explainCampaign` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  explainCampaign?:
    | Mutation.explainCampaign<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.explainCampaign<_$Scalars>>;

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
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Mutation<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Mutation {
  export type explainCampaign<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = explainCampaign$SelectionSet<_$Scalars>;

  export interface explainCampaign$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `explainCampaign` field. Some (9/12) arguments are required so you must include this.
     */
    $: explainCampaign$Arguments<_$Scalars>;
  }

  export interface explainCampaign$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * Type of the modification to the campaign explanation.
     */
    $type: $NamedTypes.$Modification;
    /**
     * Name of the campaign.
     */
    name: string;
    /**
     * Description of the campaign.
     */
    description: string;
    /**
     * Picture of the campaign.
     */
    picture: string;
    /**
     * Randomly chosen seed for the creation of the identifier.
     */
    seed: number;
    /**
     * Outcomes associated with this campaign. An outcome can either be something like
     * Trump winning the election, or something else.
     */
    outcomes: Array<$NamedTypes.$OutcomeInput<_$Scalars> | undefined | null>;
    /**
     * Expected ending timestamp.
     */
    ending: number;
    /**
     * Expected starting timestamp.
     */
    starting: number;
    /**
     * Creator address. Hex encoded. Verified to be the creator later.
     */
    creator: string;
    /**
     * X/Twitter username
     */
    x?: string | undefined | null;
    /**
     * Telegram username
     */
    telegram?: string | undefined | null;
    /**
     * Web url
     */
    web?: string | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `explainCampaign` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type explainCampaign$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<explainCampaign$SelectionSet<_$Scalars>>;
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

/**
 * HTTP-like interface for mutation. Either a delete, a logical update, or a put for the
 * first time.
 *
 * Members
 * "DELETE" - Delete this modification.
 * "PUT" - Create this modification.
 */
export type Modification = "DELETE" | "PUT";

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

/**
 * Outcome associated with a Campaign creation that's notified to the graph.
 */
export interface OutcomeInput<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> {
  /**
   * Name of the campaign outcome. Ie, "Donald Trump" for the election.
   */
  name: string;
  /**
   * Text description of the outcome.
   */
  description: string;
  /**
   * Randomly chosen seed for the creation of the identifier.
   */
  seed: number;
  /**
   * Picture of the outcome.
   */
  picture: string;
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

//                                             Frontpage
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Frontpage that should be displayed for a time window.
 */
export interface Frontpage<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `Frontpage` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | Frontpage.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Frontpage.id<_$Scalars>>;
  /**
   *
   * Select the `from` field on the `Frontpage` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  from?:
    | Frontpage.from$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Frontpage.from<_$Scalars>>;
  /**
   *
   * Select the `until` field on the `Frontpage` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  until?:
    | Frontpage.until$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Frontpage.until<_$Scalars>>;
  /**
   *
   * Select the `categories` field on the `Frontpage` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  categories?:
    | Frontpage.categories$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Frontpage.categories<_$Scalars>>;
  /**
   *
   * Select the `content` field on the `Frontpage` object. Its type is `Campaign` (a `OutputObject` kind of type).
   *
   */
  content?:
    | Frontpage.content$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Frontpage.content<_$Scalars>>;

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
    | Frontpage$FragmentInline<_$Scalars>
    | Frontpage$FragmentInline<_$Scalars>[];

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

export interface Frontpage$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Frontpage<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Frontpage {
  export type id<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>;

  export interface id$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `id` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type id$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type from<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | from$SelectionSet<_$Scalars>;

  export interface from$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `from` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type from$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | from$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type until<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | until$SelectionSet<_$Scalars>;

  export interface until$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `until` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type until$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | until$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type categories<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | categories$SelectionSet<_$Scalars>;

  export interface categories$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `categories` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type categories$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | categories$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type content<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = content$SelectionSet<_$Scalars>;

  export interface content$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Campaign<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `content` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type content$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<content$SelectionSet<_$Scalars>>;
}

//                                              Campaign
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Ongoing prediction market competition.
 */
export interface Campaign<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `name` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  name?:
    | Campaign.name$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.name<_$Scalars>>;
  /**
   *
   * Select the `description` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  description?:
    | Campaign.description$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.description<_$Scalars>>;
  /**
   *
   * Select the `picture` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  picture?:
    | Campaign.picture$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.picture<_$Scalars>>;
  /**
   *
   * Select the `creator` field on the `Campaign` object. Its type is `Wallet` (a `OutputObject` kind of type).
   *
   */
  creator?:
    | Campaign.creator$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.creator<_$Scalars>>;
  /**
   *
   * Select the `oracle` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  oracle?:
    | Campaign.oracle$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.oracle<_$Scalars>>;
  /**
   *
   * Select the `identifier` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  identifier?:
    | Campaign.identifier$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.identifier<_$Scalars>>;
  /**
   *
   * Select the `poolAddress` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  poolAddress?:
    | Campaign.poolAddress$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.poolAddress<_$Scalars>>;
  /**
   *
   * Select the `outcomes` field on the `Campaign` object. Its type is `Outcome` (a `OutputObject` kind of type).
   *
   */
  outcomes?:
    | Campaign.outcomes$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.outcomes<_$Scalars>>;
  /**
   *
   * Select the `starting` field on the `Campaign` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  starting?:
    | Campaign.starting$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.starting<_$Scalars>>;
  /**
   *
   * Select the `ending` field on the `Campaign` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  ending?:
    | Campaign.ending$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.ending<_$Scalars>>;
  /**
   *
   * Select the `x` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  x?:
    | Campaign.x$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.x<_$Scalars>>;
  /**
   *
   * Select the `telegram` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  telegram?:
    | Campaign.telegram$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.telegram<_$Scalars>>;
  /**
   *
   * Select the `web` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  web?:
    | Campaign.web$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.web<_$Scalars>>;

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
    | Campaign$FragmentInline<_$Scalars>
    | Campaign$FragmentInline<_$Scalars>[];

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

export interface Campaign$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Campaign<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Campaign {
  export type name<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | name$SelectionSet<_$Scalars>;

  export interface name$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `name` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type name$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | name$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type description<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | description$SelectionSet<_$Scalars>;

  export interface description$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `description` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type description$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | description$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type picture<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | picture$SelectionSet<_$Scalars>;

  export interface picture$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `picture` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type picture$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | picture$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type creator<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = creator$SelectionSet<_$Scalars>;

  export interface creator$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Wallet<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `creator` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type creator$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<creator$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type oracle<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | oracle$SelectionSet<_$Scalars>;

  export interface oracle$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `oracle` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type oracle$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | oracle$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type identifier<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | identifier$SelectionSet<_$Scalars>;

  export interface identifier$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `identifier` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type identifier$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | identifier$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type poolAddress<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | poolAddress$SelectionSet<_$Scalars>;

  export interface poolAddress$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `poolAddress` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type poolAddress$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | poolAddress$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type outcomes<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = outcomes$SelectionSet<_$Scalars>;

  export interface outcomes$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Outcome<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `outcomes` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type outcomes$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<outcomes$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type starting<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | starting$SelectionSet<_$Scalars>;

  export interface starting$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `starting` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type starting$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | starting$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type ending<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | ending$SelectionSet<_$Scalars>;

  export interface ending$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `ending` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type ending$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | ending$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type x<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | x$SelectionSet<_$Scalars>;

  export interface x$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `x` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type x$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | x$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type telegram<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | telegram$SelectionSet<_$Scalars>;

  export interface telegram$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `telegram` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type telegram$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | telegram$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type web<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | web$SelectionSet<_$Scalars>;

  export interface web$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `web` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type web$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | web$SelectionSet<_$Scalars>
  >;
}

//                                              Outcome
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Outcome<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `name` field on the `Outcome` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  name?:
    | Outcome.name$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Outcome.name<_$Scalars>>;
  /**
   *
   * Select the `description` field on the `Outcome` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  description?:
    | Outcome.description$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Outcome.description<_$Scalars>>;
  /**
   *
   * Select the `picture` field on the `Outcome` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  picture?:
    | Outcome.picture$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Outcome.picture<_$Scalars>>;
  /**
   *
   * Select the `identifier` field on the `Outcome` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  identifier?:
    | Outcome.identifier$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Outcome.identifier<_$Scalars>>;
  /**
   *
   * Select the `share` field on the `Outcome` object. Its type is `Share` (a `OutputObject` kind of type).
   *
   */
  share?:
    | Outcome.share$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Outcome.share<_$Scalars>>;

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
  ___?: Outcome$FragmentInline<_$Scalars> | Outcome$FragmentInline<_$Scalars>[];

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

export interface Outcome$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Outcome<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Outcome {
  export type name<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | name$SelectionSet<_$Scalars>;

  export interface name$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `name` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type name$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | name$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type description<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | description$SelectionSet<_$Scalars>;

  export interface description$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `description` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type description$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | description$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type picture<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | picture$SelectionSet<_$Scalars>;

  export interface picture$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `picture` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type picture$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | picture$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type identifier<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | identifier$SelectionSet<_$Scalars>;

  export interface identifier$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `identifier` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type identifier$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | identifier$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type share<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = share$SelectionSet<_$Scalars>;

  export interface share$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Share<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `share` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type share$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<share$SelectionSet<_$Scalars>>;
}

//                                               Wallet
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Wallet of the creator.
 */
export interface Wallet<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `address` field on the `Wallet` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  address?:
    | Wallet.address$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Wallet.address<_$Scalars>>;

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
  ___?: Wallet$FragmentInline<_$Scalars> | Wallet$FragmentInline<_$Scalars>[];

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

export interface Wallet$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Wallet<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Wallet {
  export type address<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | address$SelectionSet<_$Scalars>;

  export interface address$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `address` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type address$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | address$SelectionSet<_$Scalars>
  >;
}

//                                               Share
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Share representing the outcome of the current amount.
 */
export interface Share<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `address` field on the `Share` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  address?:
    | Share.address$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Share.address<_$Scalars>>;

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
  ___?: Share$FragmentInline<_$Scalars> | Share$FragmentInline<_$Scalars>[];

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

export interface Share$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Share<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Share {
  export type address<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | address$SelectionSet<_$Scalars>;

  export interface address$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `address` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type address$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | address$SelectionSet<_$Scalars>
  >;
}

//                                             Changelog
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * News that could be rendered to a viewer who hasn't viewed the site in a while.
 * This is CHANGELOG.md that's parsed to be of the form:
 * ```
 * ### (date) (description)
 *
 * * Markdown unsorted list
 *
 * 1. Markdown sorted list
 *
 * ... yadda yadda
 * ```
 *
 * This is converted to HTML.
 */
export interface Changelog<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `Changelog` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | Changelog.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Changelog.id<_$Scalars>>;
  /**
   *
   * Select the `title` field on the `Changelog` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  title?:
    | Changelog.title$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Changelog.title<_$Scalars>>;
  /**
   *
   * Select the `afterTs` field on the `Changelog` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  afterTs?:
    | Changelog.afterTs$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Changelog.afterTs<_$Scalars>>;
  /**
   *
   * Select the `html` field on the `Changelog` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  html?:
    | Changelog.html$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Changelog.html<_$Scalars>>;

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
    | Changelog$FragmentInline<_$Scalars>
    | Changelog$FragmentInline<_$Scalars>[];

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

export interface Changelog$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Changelog<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Changelog {
  export type id<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>;

  export interface id$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `id` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type id$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | id$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type title<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | title$SelectionSet<_$Scalars>;

  export interface title$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `title` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type title$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | title$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type afterTs<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | afterTs$SelectionSet<_$Scalars>;

  export interface afterTs$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `afterTs` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type afterTs$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | afterTs$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type html<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | html$SelectionSet<_$Scalars>;

  export interface html$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `html` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type html$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | html$SelectionSet<_$Scalars>
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
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Query<_$Scalars>;
  export type $Mutation<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Mutation<_$Scalars>;
  export type $Modification = Modification;
  export type $OutcomeInput<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = OutcomeInput<_$Scalars>;
  export type $Frontpage<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Frontpage<_$Scalars>;
  export type $Campaign<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Campaign<_$Scalars>;
  export type $Outcome<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Outcome<_$Scalars>;
  export type $Wallet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Wallet<_$Scalars>;
  export type $Share<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Share<_$Scalars>;
  export type $Changelog<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Changelog<_$Scalars>;
}
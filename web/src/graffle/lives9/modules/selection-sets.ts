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
   * Select the `campaignById` field on the `Query` object. Its type is `Campaign` (a `OutputObject` kind of type).
   *
   */
  campaignById?:
    | Query.campaignById<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.campaignById<_$Scalars>>;
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
   * Select the `userActivity` field on the `Query` object. Its type is `Activity` (a `OutputObject` kind of type).
   *
   */
  userActivity?:
    | Query.userActivity<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.userActivity<_$Scalars>>;
  /**
   *
   * Select the `userParticipatedCampaigns` field on the `Query` object. Its type is `Position` (a `OutputObject` kind of type).
   *
   */
  userParticipatedCampaigns?:
    | Query.userParticipatedCampaigns<_$Scalars>
    | $Select.SelectAlias.SelectAlias<
        Query.userParticipatedCampaigns<_$Scalars>
      >;
  /**
   *
   * Select the `userTotalVolume` field on the `Query` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  userTotalVolume?:
    | Query.userTotalVolume<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.userTotalVolume<_$Scalars>>;

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
    orderBy?: string | undefined | null;
    searchTerm?: string | undefined | null;
    page?: number | undefined | null;
    pageSize?: number | undefined | null;
    address?: string | undefined | null;
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

  export type campaignById<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = campaignById$SelectionSet<_$Scalars>;

  export interface campaignById$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Campaign<_$Scalars> {
    /**
     * Arguments for `campaignById` field. All arguments are required so you must include this.
     */
    $: campaignById$Arguments<_$Scalars>;
  }

  export interface campaignById$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    id: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaignById` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaignById$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<campaignById$SelectionSet<_$Scalars>>;

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

  // --------------------------------------------------------------------------------------------------

  export type userActivity<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = userActivity$SelectionSet<_$Scalars>;

  export interface userActivity$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Activity<_$Scalars> {
    /**
     * Arguments for `userActivity` field. Some (1/4) arguments are required so you must include this.
     */
    $: userActivity$Arguments<_$Scalars>;
  }

  export interface userActivity$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
    campaignId?: string | undefined | null;
    page?: number | undefined | null;
    pageSize?: number | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `userActivity` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type userActivity$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<userActivity$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type userParticipatedCampaigns<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = userParticipatedCampaigns$SelectionSet<_$Scalars>;

  export interface userParticipatedCampaigns$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Position<_$Scalars> {
    /**
     * Arguments for `userParticipatedCampaigns` field. All arguments are required so you must include this.
     */
    $: userParticipatedCampaigns$Arguments<_$Scalars>;
  }

  export interface userParticipatedCampaigns$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `userParticipatedCampaigns` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type userParticipatedCampaigns$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<userParticipatedCampaigns$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type userTotalVolume<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = userTotalVolume$SelectionSet<_$Scalars>;

  export interface userTotalVolume$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `userTotalVolume` field. All arguments are required so you must include this.
     */
    $: userTotalVolume$Arguments<_$Scalars>;
  }

  export interface userTotalVolume$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `userTotalVolume` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type userTotalVolume$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<userTotalVolume$SelectionSet<_$Scalars>>;
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
   * Select the `revealCommitment` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  revealCommitment?:
    | Mutation.revealCommitment$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.revealCommitment<_$Scalars>>;
  /**
   *
   * Select the `revealCommitment2` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  revealCommitment2?:
    | Mutation.revealCommitment2$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.revealCommitment2<_$Scalars>>;

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
     * Arguments for `explainCampaign` field. Some (8/15) arguments are required so you must include this.
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
    picture?: string | undefined | null;
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
     * Oracle description defines under which conditions campaigns conclude if infra market
     * used as settlement source.
     */
    oracleDescription?: string | undefined | null;
    /**
     * Oracle URLs are helper sources for documents when the infrastructure market is used as
     * a settlement source.
     */
    oracleUrls?: Array<string | undefined | null> | undefined | null;
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
    /**
     * Should this be a fake execution as a dry run?
     */
    isFake?: boolean | undefined | null;
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

  // --------------------------------------------------------------------------------------------------

  export type revealCommitment<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | revealCommitment$SelectionSet<_$Scalars>;

  export interface revealCommitment$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `revealCommitment` field. No arguments are required so you may omit this.
     */
    $?: revealCommitment$Arguments<_$Scalars>;
  }

  export interface revealCommitment$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * In this highly simplified form, this is the Trading address to provide the
     * commitment for. This information will be kept until the contract goes into a state
     * of being able to be predicted (after the whinge is picked up on).
     */
    tradingAddr?: string | undefined | null;
    /**
     * The sender's address. This is needed to simulate and then send the call. If someone
     * were to abuse this permissionless process, the degraded form would be the frontend
     * needing to be prompted for a signature before accepting submissions. The backend
     * will deduplicate this once the time has begun.
     */
    sender?: string | undefined | null;
    /**
     * The seed that's in use for this commitment. This is a large number, so this is in
     * base10 as a string, which is handled with Go.
     */
    seed?: string | undefined | null;
    /**
     * The preferred outcome, hex identified, preceded with 0x.
     */
    preferredOutcome?: string | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `revealCommitment` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type revealCommitment$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | revealCommitment$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type revealCommitment2<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | revealCommitment2$SelectionSet<_$Scalars>;

  export interface revealCommitment2$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `revealCommitment2` field. No arguments are required so you may omit this.
     */
    $?: revealCommitment2$Arguments<_$Scalars>;
  }

  export interface revealCommitment2$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * In this highly simplified form, this is the Trading address to provide the
     * commitment for. This information will be kept until the contract goes into a state
     * of being able to be predicted (after the whinge is picked up on).
     */
    tradingAddr?: string | undefined | null;
    /**
     * The sender's address. This is needed to simulate and then send the call. If someone
     * were to abuse this permissionless process, the degraded form would be the frontend
     * needing to be prompted for a signature before accepting submissions. The backend
     * will deduplicate this once the time has begun.
     */
    sender?: string | undefined | null;
    /**
     * The seed that's in use for this commitment. This is a large number, so this is in
     * base10 as a string, which is handled with Go.
     */
    seed?: string | undefined | null;
    /**
     * The preferred outcome, hex identified, preceded with 0x.
     */
    preferredOutcome?: string | undefined | null;
    /**
     * The X coordinate on the elliptic curve for the signature. Hex encoded, with the 0x
     * prefix.
     */
    rr?: string | undefined | null;
    /**
     * The signature proof, derived from the private key and hash of this submission
     * concenated left to right. Hex encoded, with the 0x prefix.
     */
    s?: string | undefined | null;
    /**
     * The recovery ID (27) for the private key used for this signature. A Int.
     */
    v?: string | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `revealCommitment2` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type revealCommitment2$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    | $Select.Indicator.NoArgsIndicator
    | revealCommitment2$SelectionSet<_$Scalars>
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

/**
 * HTTP-like interface for mutation. Either a delete, a logical update, or a put for the
 * first time.
 *
 * Members
 * "DELETE" - Delete this modification.
 * "PUT" - Create this modification.
 */
export type Modification = "DELETE" | "PUT";

/**
 * Defines the method used to determine the winner of a campaign.
 *
 * Members
 * "ORACLE" - Infrastructure market.
 * "POLL" - Opinion Poll.
 * "AI" - A.I Resolver.
 * "CONTRACT" - Contract State.
 */
export type SettlementType = "ORACLE" | "POLL" | "AI" | "CONTRACT";

/**
 * Represents the type of an activity.
 */
export type ActivityType = "buy" | "sell";

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
   * Randomly chosen seed for the creation of the identifier.
   */
  seed: number;
  /**
   * Picture of the outcome.
   */
  picture?: string | undefined | null;
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

//                                              Position
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Participated pool address of the campaign and bought and sought outcome ids
 */
export interface Position<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `campaignId` field on the `Position` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  campaignId?:
    | Position.campaignId$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Position.campaignId<_$Scalars>>;
  /**
   *
   * Select the `outcomeIds` field on the `Position` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  outcomeIds?:
    | Position.outcomeIds$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Position.outcomeIds<_$Scalars>>;
  /**
   *
   * Select the `content` field on the `Position` object. Its type is `Campaign` (a `OutputObject` kind of type).
   *
   */
  content?:
    | Position.content$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Position.content<_$Scalars>>;

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
    | Position$FragmentInline<_$Scalars>
    | Position$FragmentInline<_$Scalars>[];

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

export interface Position$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Position<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Position {
  export type campaignId<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | campaignId$SelectionSet<_$Scalars>;

  export interface campaignId$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaignId` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaignId$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | campaignId$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type outcomeIds<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | outcomeIds$SelectionSet<_$Scalars>;

  export interface outcomeIds$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `outcomeIds` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type outcomeIds$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | outcomeIds$SelectionSet<_$Scalars>
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
   * Select the `createdAt` field on the `Campaign` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  createdAt?:
    | Campaign.createdAt$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.createdAt<_$Scalars>>;
  /**
   *
   * Select the `settlement` field on the `Campaign` object. Its type is `SettlementType` (a `Enum` kind of type).
   *
   */
  settlement?:
    | Campaign.settlement$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.settlement<_$Scalars>>;
  /**
   *
   * Select the `oracleDescription` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  oracleDescription?:
    | Campaign.oracleDescription$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.oracleDescription<_$Scalars>>;
  /**
   *
   * Select the `oracleUrls` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  oracleUrls?:
    | Campaign.oracleUrls$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.oracleUrls<_$Scalars>>;
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
   * Select the `winner` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  winner?:
    | Campaign.winner$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.winner<_$Scalars>>;
  /**
   *
   * Select the `totalVolume` field on the `Campaign` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  totalVolume?:
    | Campaign.totalVolume$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.totalVolume<_$Scalars>>;
  /**
   *
   * Select the `investmentAmounts` field on the `Campaign` object. Its type is `InvestmentAmounts` (a `OutputObject` kind of type).
   *
   */
  investmentAmounts?:
    | Campaign.investmentAmounts$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.investmentAmounts<_$Scalars>>;
  /**
   *
   * Select the `banners` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  banners?:
    | Campaign.banners$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.banners<_$Scalars>>;
  /**
   *
   * Select the `categories` field on the `Campaign` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  categories?:
    | Campaign.categories$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.categories<_$Scalars>>;

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

  export type createdAt<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | createdAt$SelectionSet<_$Scalars>;

  export interface createdAt$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `createdAt` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type createdAt$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | createdAt$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type settlement<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | settlement$SelectionSet<_$Scalars>;

  export interface settlement$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `settlement` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type settlement$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | settlement$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type oracleDescription<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | oracleDescription$SelectionSet<_$Scalars>;

  export interface oracleDescription$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `oracleDescription` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type oracleDescription$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    | $Select.Indicator.NoArgsIndicator
    | oracleDescription$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type oracleUrls<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | oracleUrls$SelectionSet<_$Scalars>;

  export interface oracleUrls$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `oracleUrls` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type oracleUrls$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | oracleUrls$SelectionSet<_$Scalars>
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

  // --------------------------------------------------------------------------------------------------

  export type winner<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | winner$SelectionSet<_$Scalars>;

  export interface winner$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `winner` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type winner$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | winner$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type totalVolume<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | totalVolume$SelectionSet<_$Scalars>;

  export interface totalVolume$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `totalVolume` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type totalVolume$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | totalVolume$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type investmentAmounts<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = investmentAmounts$SelectionSet<_$Scalars>;

  export interface investmentAmounts$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$InvestmentAmounts<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `investmentAmounts` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type investmentAmounts$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<investmentAmounts$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type banners<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | banners$SelectionSet<_$Scalars>;

  export interface banners$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `banners` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type banners$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | banners$SelectionSet<_$Scalars>
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
}

//                                         InvestmentAmounts
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface InvestmentAmounts<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `InvestmentAmounts` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | InvestmentAmounts.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<InvestmentAmounts.id<_$Scalars>>;
  /**
   *
   * Select the `usdc` field on the `InvestmentAmounts` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  usdc?:
    | InvestmentAmounts.usdc$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<InvestmentAmounts.usdc<_$Scalars>>;
  /**
   *
   * Select the `share` field on the `InvestmentAmounts` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  share?:
    | InvestmentAmounts.share$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<InvestmentAmounts.share<_$Scalars>>;

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
    | InvestmentAmounts$FragmentInline<_$Scalars>
    | InvestmentAmounts$FragmentInline<_$Scalars>[];

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

export interface InvestmentAmounts$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends InvestmentAmounts<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace InvestmentAmounts {
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

  export type usdc<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | usdc$SelectionSet<_$Scalars>;

  export interface usdc$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `usdc` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type usdc$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | usdc$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type share<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | share$SelectionSet<_$Scalars>;

  export interface share$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

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
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | share$SelectionSet<_$Scalars>
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

//                                              Activity
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Represents a buy or sell activity.
 */
export interface Activity<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `txHash` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  txHash?:
    | Activity.txHash$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.txHash<_$Scalars>>;
  /**
   *
   * Select the `recipient` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  recipient?:
    | Activity.recipient$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.recipient<_$Scalars>>;
  /**
   *
   * Select the `poolAddress` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  poolAddress?:
    | Activity.poolAddress$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.poolAddress<_$Scalars>>;
  /**
   *
   * Select the `fromAmount` field on the `Activity` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  fromAmount?:
    | Activity.fromAmount$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.fromAmount<_$Scalars>>;
  /**
   *
   * Select the `fromSymbol` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  fromSymbol?:
    | Activity.fromSymbol$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.fromSymbol<_$Scalars>>;
  /**
   *
   * Select the `toAmount` field on the `Activity` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  toAmount?:
    | Activity.toAmount$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.toAmount<_$Scalars>>;
  /**
   *
   * Select the `toSymbol` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  toSymbol?:
    | Activity.toSymbol$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.toSymbol<_$Scalars>>;
  /**
   *
   * Select the `type` field on the `Activity` object. Its type is `ActivityType` (a `Enum` kind of type).
   *
   */
  type?:
    | Activity.type$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.type<_$Scalars>>;
  /**
   *
   * Select the `outcomeId` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  outcomeId?:
    | Activity.outcomeId$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.outcomeId<_$Scalars>>;
  /**
   *
   * Select the `outcomeName` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  outcomeName?:
    | Activity.outcomeName$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.outcomeName<_$Scalars>>;
  /**
   *
   * Select the `outcomePic` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  outcomePic?:
    | Activity.outcomePic$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.outcomePic<_$Scalars>>;
  /**
   *
   * Select the `campaignName` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  campaignName?:
    | Activity.campaignName$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.campaignName<_$Scalars>>;
  /**
   *
   * Select the `campaignId` field on the `Activity` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  campaignId?:
    | Activity.campaignId$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.campaignId<_$Scalars>>;
  /**
   *
   * Select the `totalVolume` field on the `Activity` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  totalVolume?:
    | Activity.totalVolume$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.totalVolume<_$Scalars>>;
  /**
   *
   * Select the `createdAt` field on the `Activity` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  createdAt?:
    | Activity.createdAt$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Activity.createdAt<_$Scalars>>;

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
    | Activity$FragmentInline<_$Scalars>
    | Activity$FragmentInline<_$Scalars>[];

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

export interface Activity$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Activity<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Activity {
  export type txHash<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | txHash$SelectionSet<_$Scalars>;

  export interface txHash$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `txHash` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type txHash$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | txHash$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type recipient<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | recipient$SelectionSet<_$Scalars>;

  export interface recipient$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `recipient` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type recipient$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | recipient$SelectionSet<_$Scalars>
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

  export type fromAmount<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | fromAmount$SelectionSet<_$Scalars>;

  export interface fromAmount$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `fromAmount` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type fromAmount$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | fromAmount$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type fromSymbol<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | fromSymbol$SelectionSet<_$Scalars>;

  export interface fromSymbol$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `fromSymbol` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type fromSymbol$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | fromSymbol$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type toAmount<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | toAmount$SelectionSet<_$Scalars>;

  export interface toAmount$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `toAmount` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type toAmount$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | toAmount$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type toSymbol<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | toSymbol$SelectionSet<_$Scalars>;

  export interface toSymbol$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `toSymbol` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type toSymbol$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | toSymbol$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type type<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | type$SelectionSet<_$Scalars>;

  export interface type$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `type` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type type$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | type$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type outcomeId<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | outcomeId$SelectionSet<_$Scalars>;

  export interface outcomeId$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `outcomeId` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type outcomeId$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | outcomeId$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type outcomeName<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | outcomeName$SelectionSet<_$Scalars>;

  export interface outcomeName$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `outcomeName` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type outcomeName$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | outcomeName$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type outcomePic<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | outcomePic$SelectionSet<_$Scalars>;

  export interface outcomePic$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `outcomePic` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type outcomePic$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | outcomePic$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type campaignName<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | campaignName$SelectionSet<_$Scalars>;

  export interface campaignName$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaignName` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaignName$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | campaignName$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type campaignId<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | campaignId$SelectionSet<_$Scalars>;

  export interface campaignId$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaignId` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaignId$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | campaignId$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type totalVolume<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | totalVolume$SelectionSet<_$Scalars>;

  export interface totalVolume$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `totalVolume` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type totalVolume$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | totalVolume$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type createdAt<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | createdAt$SelectionSet<_$Scalars>;

  export interface createdAt$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `createdAt` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type createdAt$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | createdAt$SelectionSet<_$Scalars>
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
  export type $SettlementType = SettlementType;
  export type $ActivityType = ActivityType;
  export type $OutcomeInput<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = OutcomeInput<_$Scalars>;
  export type $Position<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Position<_$Scalars>;
  export type $Campaign<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Campaign<_$Scalars>;
  export type $InvestmentAmounts<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = InvestmentAmounts<_$Scalars>;
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
  export type $Activity<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Activity<_$Scalars>;
}

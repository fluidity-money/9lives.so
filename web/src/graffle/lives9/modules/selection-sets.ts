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
   * Select the `positionsHistory` field on the `Query` object. Its type is `Activity` (a `OutputObject` kind of type).
   *
   */
  positionsHistory?:
    | Query.positionsHistory<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.positionsHistory<_$Scalars>>;
  /**
   *
   * Select the `userClaims` field on the `Query` object. Its type is `Claim` (a `OutputObject` kind of type).
   *
   */
  userClaims?:
    | Query.userClaims<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.userClaims<_$Scalars>>;
  /**
   *
   * Select the `userProfile` field on the `Query` object. Its type is `Profile` (a `OutputObject` kind of type).
   *
   */
  userProfile?:
    | Query.userProfile<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.userProfile<_$Scalars>>;
  /**
   *
   * Select the `userLiquidity` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  userLiquidity?:
    | Query.userLiquidity<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.userLiquidity<_$Scalars>>;
  /**
   *
   * Select the `referrersForAddress` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  referrersForAddress?:
    | Query.referrersForAddress<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.referrersForAddress<_$Scalars>>;
  /**
   *
   * Select the `leaderboards` field on the `Query` object. Its type is `LeaderboardWeekly` (a `OutputObject` kind of type).
   *
   */
  leaderboards?:
    | Query.leaderboards$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.leaderboards<_$Scalars>>;
  /**
   *
   * Select the `referrerByCode` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  referrerByCode?:
    | Query.referrerByCode<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.referrerByCode<_$Scalars>>;
  /**
   *
   * Select the `featuredCampaign` field on the `Query` object. Its type is `Campaign` (a `OutputObject` kind of type).
   *
   */
  featuredCampaign?:
    | Query.featuredCampaign$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.featuredCampaign<_$Scalars>>;
  /**
   *
   * Select the `userLPs` field on the `Query` object. Its type is `LP` (a `OutputObject` kind of type).
   *
   */
  userLPs?:
    | Query.userLPs<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.userLPs<_$Scalars>>;
  /**
   *
   * Select the `countReferees` field on the `Query` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  countReferees?:
    | Query.countReferees<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.countReferees<_$Scalars>>;
  /**
   *
   * Select the `userWonCampaignsProfits` field on the `Query` object. Its type is `CampaignProfit` (a `OutputObject` kind of type).
   *
   */
  userWonCampaignsProfits?:
    | Query.userWonCampaignsProfits<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.userWonCampaignsProfits<_$Scalars>>;
  /**
   *
   * Select the `campaignComments` field on the `Query` object. Its type is `Comment` (a `OutputObject` kind of type).
   *
   */
  campaignComments?:
    | Query.campaignComments<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.campaignComments<_$Scalars>>;
  /**
   *
   * Select the `campaignPriceEvents` field on the `Query` object. Its type is `PriceEvent` (a `OutputObject` kind of type).
   *
   */
  campaignPriceEvents?:
    | Query.campaignPriceEvents<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.campaignPriceEvents<_$Scalars>>;
  /**
   *
   * Select the `campaignWeeklyVolume` field on the `Query` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  campaignWeeklyVolume?:
    | Query.campaignWeeklyVolume<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.campaignWeeklyVolume<_$Scalars>>;
  /**
   *
   * Select the `campaignBySymbol` field on the `Query` object. Its type is `Campaign` (a `OutputObject` kind of type).
   *
   */
  campaignBySymbol?:
    | Query.campaignBySymbol<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.campaignBySymbol<_$Scalars>>;
  /**
   *
   * Select the `timebasedCampaigns` field on the `Query` object. Its type is `Campaign` (a `OutputObject` kind of type).
   *
   */
  timebasedCampaigns?:
    | Query.timebasedCampaigns<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.timebasedCampaigns<_$Scalars>>;

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
     * Arguments for `userParticipatedCampaigns` field. Some (1/3) arguments are required so you must include this.
     */
    $: userParticipatedCampaigns$Arguments<_$Scalars>;
  }

  export interface userParticipatedCampaigns$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
    page?: number | undefined | null;
    pageSize?: number | undefined | null;
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

  // --------------------------------------------------------------------------------------------------

  export type positionsHistory<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = positionsHistory$SelectionSet<_$Scalars>;

  export interface positionsHistory$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Activity<_$Scalars> {
    /**
     * Arguments for `positionsHistory` field. All arguments are required so you must include this.
     */
    $: positionsHistory$Arguments<_$Scalars>;
  }

  export interface positionsHistory$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
    outcomeIds: Array<string | undefined | null>;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `positionsHistory` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type positionsHistory$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<positionsHistory$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type userClaims<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = userClaims$SelectionSet<_$Scalars>;

  export interface userClaims$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Claim<_$Scalars> {
    /**
     * Arguments for `userClaims` field. Some (1/2) arguments are required so you must include this.
     */
    $: userClaims$Arguments<_$Scalars>;
  }

  export interface userClaims$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
    campaignId?: string | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `userClaims` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type userClaims$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<userClaims$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type userProfile<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = userProfile$SelectionSet<_$Scalars>;

  export interface userProfile$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Profile<_$Scalars> {
    /**
     * Arguments for `userProfile` field. All arguments are required so you must include this.
     */
    $: userProfile$Arguments<_$Scalars>;
  }

  export interface userProfile$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `userProfile` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type userProfile$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<userProfile$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type userLiquidity<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = userLiquidity$SelectionSet<_$Scalars>;

  export interface userLiquidity$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `userLiquidity` field. Some (1/2) arguments are required so you must include this.
     */
    $: userLiquidity$Arguments<_$Scalars>;
  }

  export interface userLiquidity$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
    tradingAddr?: string | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `userLiquidity` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type userLiquidity$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<userLiquidity$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type referrersForAddress<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = referrersForAddress$SelectionSet<_$Scalars>;

  export interface referrersForAddress$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `referrersForAddress` field. All arguments are required so you must include this.
     */
    $: referrersForAddress$Arguments<_$Scalars>;
  }

  export interface referrersForAddress$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `referrersForAddress` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type referrersForAddress$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<referrersForAddress$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type leaderboards<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = leaderboards$SelectionSet<_$Scalars>;

  export interface leaderboards$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$LeaderboardWeekly<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `leaderboards` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type leaderboards$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<leaderboards$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type referrerByCode<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = referrerByCode$SelectionSet<_$Scalars>;

  export interface referrerByCode$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `referrerByCode` field. All arguments are required so you must include this.
     */
    $: referrerByCode$Arguments<_$Scalars>;
  }

  export interface referrerByCode$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    code: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `referrerByCode` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type referrerByCode$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<referrerByCode$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type featuredCampaign<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = featuredCampaign$SelectionSet<_$Scalars>;

  export interface featuredCampaign$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Campaign<_$Scalars> {
    /**
     * Arguments for `featuredCampaign` field. No arguments are required so you may omit this.
     */
    $?: featuredCampaign$Arguments<_$Scalars>;
  }

  export interface featuredCampaign$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    limit?: number | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `featuredCampaign` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type featuredCampaign$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<featuredCampaign$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type userLPs<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = userLPs$SelectionSet<_$Scalars>;

  export interface userLPs$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$LP<_$Scalars> {
    /**
     * Arguments for `userLPs` field. All arguments are required so you must include this.
     */
    $: userLPs$Arguments<_$Scalars>;
  }

  export interface userLPs$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `userLPs` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type userLPs$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<userLPs$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type countReferees<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = countReferees$SelectionSet<_$Scalars>;

  export interface countReferees$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `countReferees` field. All arguments are required so you must include this.
     */
    $: countReferees$Arguments<_$Scalars>;
  }

  export interface countReferees$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    referrerAddress: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `countReferees` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type countReferees$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<countReferees$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type userWonCampaignsProfits<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = userWonCampaignsProfits$SelectionSet<_$Scalars>;

  export interface userWonCampaignsProfits$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$CampaignProfit<_$Scalars> {
    /**
     * Arguments for `userWonCampaignsProfits` field. All arguments are required so you must include this.
     */
    $: userWonCampaignsProfits$Arguments<_$Scalars>;
  }

  export interface userWonCampaignsProfits$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    address: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `userWonCampaignsProfits` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type userWonCampaignsProfits$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<userWonCampaignsProfits$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type campaignComments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = campaignComments$SelectionSet<_$Scalars>;

  export interface campaignComments$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Comment<_$Scalars> {
    /**
     * Arguments for `campaignComments` field. Some (1/4) arguments are required so you must include this.
     */
    $: campaignComments$Arguments<_$Scalars>;
  }

  export interface campaignComments$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    campaignId: string;
    onlyHolders?: boolean | undefined | null;
    page?: number | undefined | null;
    pageSize?: number | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaignComments` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaignComments$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<campaignComments$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type campaignPriceEvents<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = campaignPriceEvents$SelectionSet<_$Scalars>;

  export interface campaignPriceEvents$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$PriceEvent<_$Scalars> {
    /**
     * Arguments for `campaignPriceEvents` field. All arguments are required so you must include this.
     */
    $: campaignPriceEvents$Arguments<_$Scalars>;
  }

  export interface campaignPriceEvents$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    poolAddress: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaignPriceEvents` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaignPriceEvents$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<campaignPriceEvents$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type campaignWeeklyVolume<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = campaignWeeklyVolume$SelectionSet<_$Scalars>;

  export interface campaignWeeklyVolume$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `campaignWeeklyVolume` field. All arguments are required so you must include this.
     */
    $: campaignWeeklyVolume$Arguments<_$Scalars>;
  }

  export interface campaignWeeklyVolume$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    poolAddress: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaignWeeklyVolume` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaignWeeklyVolume$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<campaignWeeklyVolume$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type campaignBySymbol<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = campaignBySymbol$SelectionSet<_$Scalars>;

  export interface campaignBySymbol$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Campaign<_$Scalars> {
    /**
     * Arguments for `campaignBySymbol` field. All arguments are required so you must include this.
     */
    $: campaignBySymbol$Arguments<_$Scalars>;
  }

  export interface campaignBySymbol$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    symbol: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaignBySymbol` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaignBySymbol$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<campaignBySymbol$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type timebasedCampaigns<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = timebasedCampaigns$SelectionSet<_$Scalars>;

  export interface timebasedCampaigns$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Campaign<_$Scalars> {
    /**
     * Arguments for `timebasedCampaigns` field. All arguments are required so you must include this.
     */
    $: timebasedCampaigns$Arguments<_$Scalars>;
  }

  export interface timebasedCampaigns$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    categories: Array<string | undefined | null>;
    tokens: Array<string | undefined | null>;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `timebasedCampaigns` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type timebasedCampaigns$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<timebasedCampaigns$SelectionSet<_$Scalars>>;
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
   * Select the `postComment` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  postComment?:
    | Mutation.postComment<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.postComment<_$Scalars>>;
  /**
   *
   * Select the `deleteComment` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  deleteComment?:
    | Mutation.deleteComment<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.deleteComment<_$Scalars>>;
  /**
   *
   * Select the `requestPaymaster` field on the `Mutation` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  requestPaymaster?:
    | Mutation.requestPaymaster<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.requestPaymaster<_$Scalars>>;
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
    | Mutation.revealCommitment<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.revealCommitment<_$Scalars>>;
  /**
   *
   * Select the `revealCommitment2` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  revealCommitment2?:
    | Mutation.revealCommitment2<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.revealCommitment2<_$Scalars>>;
  /**
   *
   * Select the `synchProfile` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  synchProfile?:
    | Mutation.synchProfile<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.synchProfile<_$Scalars>>;
  /**
   *
   * Select the `genReferrer` field on the `Mutation` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  genReferrer?:
    | Mutation.genReferrer<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.genReferrer<_$Scalars>>;
  /**
   *
   * Select the `associateReferral` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  associateReferral?:
    | Mutation.associateReferral<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.associateReferral<_$Scalars>>;

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
  export type postComment<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = postComment$SelectionSet<_$Scalars>;

  export interface postComment$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `postComment` field. All arguments are required so you must include this.
     */
    $: postComment$Arguments<_$Scalars>;
  }

  export interface postComment$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    campaignId: string;
    walletAddress: string;
    content: string;
    rr: string;
    s: string;
    v: number;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `postComment` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type postComment$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<postComment$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type deleteComment<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = deleteComment$SelectionSet<_$Scalars>;

  export interface deleteComment$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `deleteComment` field. All arguments are required so you must include this.
     */
    $: deleteComment$Arguments<_$Scalars>;
  }

  export interface deleteComment$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    campaignId: string;
    id: number;
    walletAddress: string;
    content: string;
    rr: string;
    s: string;
    v: number;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `deleteComment` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type deleteComment$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<deleteComment$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type requestPaymaster<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = requestPaymaster$SelectionSet<_$Scalars>;

  export interface requestPaymaster$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `requestPaymaster` field. Some (18/21) arguments are required so you must include this.
     */
    $: requestPaymaster$Arguments<_$Scalars>;
  }

  export interface requestPaymaster$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * Ticket number of the Paymaster operation (if any). This could be used to delete it
     * from the request pool if needed.
     */
    ticket?: number | undefined | null;
    /**
     * Type of modification to the Paymaster operation.
     */
    $type: $NamedTypes.$Modification;
    /**
     * Nonce of the operation to bump with.
     */
    nonce: string;
    /**
     * Execution deadline of the Paymaster operation.
     */
    deadline: number;
    /**
     * The amount the user supplied with this Permit signature.
     */
    permitAmount: string;
    /**
     * Arguments for this will be reconstructed based on the arguments to the Paymaster.
     */
    permitV: number;
    permitR: string;
    permitS: string;
    /**
     * Type of Paymaster operation to perform.
     */
    $operation: $NamedTypes.$PaymasterOperation;
    /**
     * Owner to do this operation for (the sender's address).
     */
    owner: string;
    /**
     * Outcome to use, if any.
     */
    outcome?: string | undefined | null;
    /**
     * Referrer of the user (if any).
     */
    referrer?: string | undefined | null;
    /**
     * Market to perform this operation for.
     */
    market: string;
    /**
     * Quoted fee to denominate from the user's USDC asset. Should be based on a quote
     * from Camelot using a quote.
     */
    maximumFee: string;
    /**
     * Amount of the base asset spend for the operation. This could be the amount to sell
     * if selling, or USDC if buying.
     */
    amountToSpend: string;
    /**
     * Minimum number the replacement asset to receive back, if any. This could be USDC if
     * selling, or USDC if buying.
     */
    minimumBack: string;
    /**
     * The originating chain ID for this signature.
     */
    originatingChainId: string;
    /**
     * The outgoing chain EID that's needed for Stargate.
     */
    outgoingChainEid: number;
    rr: string;
    s: string;
    v: number;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `requestPaymaster` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type requestPaymaster$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<requestPaymaster$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type explainCampaign<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = explainCampaign$SelectionSet<_$Scalars>;

  export interface explainCampaign$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `explainCampaign` field. Some (9/18) arguments are required so you must include this.
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
    /**
     * Is this a DPPM market? This is needed for price prediction market types.
     */
    isDppm: boolean;
    /**
     * Explicitly set the categories, potentially requiring the user submit some credentials
     * to do so.
     */
    categories?: Array<string | undefined | null> | undefined | null;
    /**
     * Price metadata field is needed for automated resolution of some kinds of DPPM markets.
     * The admin secret is needed for this.
     */
    priceMetadata?:
      | $NamedTypes.$PriceMetadataInput<_$Scalars>
      | undefined
      | null;
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
  > = revealCommitment$SelectionSet<_$Scalars>;

  export interface revealCommitment$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `revealCommitment` field. All arguments are required so you must include this.
     */
    $: revealCommitment$Arguments<_$Scalars>;
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
    tradingAddr: string;
    /**
     * The sender's address. This is needed to simulate and then send the call. If someone
     * were to abuse this permissionless process, the degraded form would be the frontend
     * needing to be prompted for a signature before accepting submissions. The backend
     * will deduplicate this once the time has begun.
     */
    sender: string;
    /**
     * The seed that's in use for this commitment. This is a large number, so this is in
     * base10 as a string, which is handled with Go.
     */
    seed: string;
    /**
     * The preferred outcome, hex identified, preceded with 0x.
     */
    preferredOutcome: string;
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
  > = $$Utilities.Simplify<revealCommitment$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type revealCommitment2<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = revealCommitment2$SelectionSet<_$Scalars>;

  export interface revealCommitment2$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `revealCommitment2` field. All arguments are required so you must include this.
     */
    $: revealCommitment2$Arguments<_$Scalars>;
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
    tradingAddr: string;
    /**
     * The sender's address. This is needed to simulate and then send the call. If someone
     * were to abuse this permissionless process, the degraded form would be the frontend
     * needing to be prompted for a signature before accepting submissions. The backend
     * will deduplicate this once the time has begun.
     */
    sender: string;
    /**
     * The seed that's in use for this commitment. This is a large number, so this is in
     * base10 as a string, which is handled with Go.
     */
    seed: string;
    /**
     * The preferred outcome, hex identified, preceded with 0x.
     */
    preferredOutcome: string;
    /**
     * The X coordinate on the elliptic curve for the signature. Hex encoded, with the 0x
     * prefix.
     */
    rr: string;
    /**
     * The signature proof, derived from the private key and hash of this submission
     * concenated left to right. Hex encoded, with the 0x prefix.
     */
    s: string;
    /**
     * The recovery ID (27) for the private key used for this signature. A Int.
     */
    v: string;
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
  > = $$Utilities.Simplify<revealCommitment2$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type synchProfile<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = synchProfile$SelectionSet<_$Scalars>;

  export interface synchProfile$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `synchProfile` field. All arguments are required so you must include this.
     */
    $: synchProfile$Arguments<_$Scalars>;
  }

  export interface synchProfile$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    walletAddress: string;
    email: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `synchProfile` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type synchProfile$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<synchProfile$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type genReferrer<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = genReferrer$SelectionSet<_$Scalars>;

  export interface genReferrer$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `genReferrer` field. All arguments are required so you must include this.
     */
    $: genReferrer$Arguments<_$Scalars>;
  }

  export interface genReferrer$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * Wallet address to generate the code for.
     */
    walletAddress: string;
    /**
     * The code that the user chose to associate with them.
     */
    code: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `genReferrer` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type genReferrer$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<genReferrer$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type associateReferral<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = associateReferral$SelectionSet<_$Scalars>;

  export interface associateReferral$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `associateReferral` field. All arguments are required so you must include this.
     */
    $: associateReferral$Arguments<_$Scalars>;
  }

  export interface associateReferral$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * The user's address to verify this for.
     */
    sender: string;
    /**
     * The code the referrer generated here.
     */
    code: string;
    /**
     * The X coordinate on the elliptic curve for the signature. Hex encoded, with the 0x
     * prefix.
     */
    rr: string;
    /**
     * The signature proof, derived from the private key and hash of this submission
     * concenated left to right. Hex encoded, with the 0x prefix.
     */
    s: string;
    /**
     * The recovery ID (27) for the private key used for this signature. A Int.
     */
    v: number;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `associateReferral` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type associateReferral$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<associateReferral$SelectionSet<_$Scalars>>;
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

export type PaymasterOperation =
  | "MINT"
  | "SELL"
  | "ADD_LIQUIDITY"
  | "REMOVE_LIQUIDITY"
  | "WITHDRAW_USDC";

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

/**
 * Price metadata that's needed for display to the short-term price prediction data.
 */
export interface PriceMetadataInput<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> {
  /**
   * Base asset that's used for this market. This is the other asset, like BTC, or ETH.
   */
  baseAsset: string;
  /**
   * The quote asset that's used for this market. This is usually USDC.
   */
  quoteAsset: string;
  /**
   * The price target that this needs to be above for the "yes" outcome to resolve.
   */
  priceTargetForUp: string;
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

//                                             PriceEvent
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface PriceEvent<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `createdAt` field on the `PriceEvent` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  createdAt?:
    | PriceEvent.createdAt$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<PriceEvent.createdAt<_$Scalars>>;
  /**
   *
   * Select the `shares` field on the `PriceEvent` object. Its type is `CampaignShare` (a `OutputObject` kind of type).
   *
   */
  shares?:
    | PriceEvent.shares$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<PriceEvent.shares<_$Scalars>>;

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
    | PriceEvent$FragmentInline<_$Scalars>
    | PriceEvent$FragmentInline<_$Scalars>[];

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

export interface PriceEvent$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends PriceEvent<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace PriceEvent {
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

  export type shares<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = shares$SelectionSet<_$Scalars>;

  export interface shares$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$CampaignShare<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `shares` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type shares$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<shares$SelectionSet<_$Scalars>>;
}

//                                         CommentInvestment
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface CommentInvestment<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `CommentInvestment` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | CommentInvestment.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<CommentInvestment.id<_$Scalars>>;
  /**
   *
   * Select the `amount` field on the `CommentInvestment` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  amount?:
    | CommentInvestment.amount$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<CommentInvestment.amount<_$Scalars>>;

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
    | CommentInvestment$FragmentInline<_$Scalars>
    | CommentInvestment$FragmentInline<_$Scalars>[];

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

export interface CommentInvestment$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends CommentInvestment<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace CommentInvestment {
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

  export type amount<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | amount$SelectionSet<_$Scalars>;

  export interface amount$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `amount` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type amount$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | amount$SelectionSet<_$Scalars>
  >;
}

//                                              Comment
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Comment<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `Comment` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | Comment.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Comment.id<_$Scalars>>;
  /**
   *
   * Select the `campaignId` field on the `Comment` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  campaignId?:
    | Comment.campaignId$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Comment.campaignId<_$Scalars>>;
  /**
   *
   * Select the `createdAt` field on the `Comment` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  createdAt?:
    | Comment.createdAt$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Comment.createdAt<_$Scalars>>;
  /**
   *
   * Select the `walletAddress` field on the `Comment` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  walletAddress?:
    | Comment.walletAddress$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Comment.walletAddress<_$Scalars>>;
  /**
   *
   * Select the `content` field on the `Comment` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  content?:
    | Comment.content$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Comment.content<_$Scalars>>;
  /**
   *
   * Select the `investments` field on the `Comment` object. Its type is `CommentInvestment` (a `OutputObject` kind of type).
   *
   */
  investments?:
    | Comment.investments$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Comment.investments<_$Scalars>>;

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
  ___?: Comment$FragmentInline<_$Scalars> | Comment$FragmentInline<_$Scalars>[];

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

export interface Comment$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Comment<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Comment {
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

  export type walletAddress<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | walletAddress$SelectionSet<_$Scalars>;

  export interface walletAddress$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `walletAddress` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type walletAddress$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | walletAddress$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type content<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | content$SelectionSet<_$Scalars>;

  export interface content$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

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
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | content$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type investments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = investments$SelectionSet<_$Scalars>;

  export interface investments$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$CommentInvestment<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `investments` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type investments$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<investments$SelectionSet<_$Scalars>>;
}

//                                                 LP
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface LP<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `liquidity` field on the `LP` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  liquidity?:
    | LP.liquidity$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LP.liquidity<_$Scalars>>;
  /**
   *
   * Select the `campaign` field on the `LP` object. Its type is `Campaign` (a `OutputObject` kind of type).
   *
   */
  campaign?:
    | LP.campaign$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LP.campaign<_$Scalars>>;

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
  ___?: LP$FragmentInline<_$Scalars> | LP$FragmentInline<_$Scalars>[];

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

export interface LP$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends LP<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace LP {
  export type liquidity<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | liquidity$SelectionSet<_$Scalars>;

  export interface liquidity$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `liquidity` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type liquidity$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | liquidity$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type campaign<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = campaign$SelectionSet<_$Scalars>;

  export interface campaign$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Campaign<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `campaign` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type campaign$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<campaign$SelectionSet<_$Scalars>>;
}

//                                           CampaignProfit
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface CampaignProfit<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `poolAddress` field on the `CampaignProfit` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  poolAddress?:
    | CampaignProfit.poolAddress$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<CampaignProfit.poolAddress<_$Scalars>>;
  /**
   *
   * Select the `profit` field on the `CampaignProfit` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  profit?:
    | CampaignProfit.profit$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<CampaignProfit.profit<_$Scalars>>;
  /**
   *
   * Select the `winner` field on the `CampaignProfit` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  winner?:
    | CampaignProfit.winner$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<CampaignProfit.winner<_$Scalars>>;

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
    | CampaignProfit$FragmentInline<_$Scalars>
    | CampaignProfit$FragmentInline<_$Scalars>[];

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

export interface CampaignProfit$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends CampaignProfit<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace CampaignProfit {
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

  export type profit<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | profit$SelectionSet<_$Scalars>;

  export interface profit$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `profit` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type profit$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | profit$SelectionSet<_$Scalars>
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
}

//                                              Settings
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Settings<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `notification` field on the `Settings` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  notification?:
    | Settings.notification$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Settings.notification<_$Scalars>>;
  /**
   *
   * Select the `refererr` field on the `Settings` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  refererr?:
    | Settings.refererr$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Settings.refererr<_$Scalars>>;

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
    | Settings$FragmentInline<_$Scalars>
    | Settings$FragmentInline<_$Scalars>[];

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

export interface Settings$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Settings<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Settings {
  export type notification<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | notification$SelectionSet<_$Scalars>;

  export interface notification$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `notification` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type notification$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | notification$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type refererr<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | refererr$SelectionSet<_$Scalars>;

  export interface refererr$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `refererr` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type refererr$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | refererr$SelectionSet<_$Scalars>
  >;
}

//                                              Profile
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Profile<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `walletAddress` field on the `Profile` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  walletAddress?:
    | Profile.walletAddress$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Profile.walletAddress<_$Scalars>>;
  /**
   *
   * Select the `email` field on the `Profile` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  email?:
    | Profile.email$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Profile.email<_$Scalars>>;
  /**
   *
   * Select the `settings` field on the `Profile` object. Its type is `Settings` (a `OutputObject` kind of type).
   *
   */
  settings?:
    | Profile.settings$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Profile.settings<_$Scalars>>;

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
  ___?: Profile$FragmentInline<_$Scalars> | Profile$FragmentInline<_$Scalars>[];

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

export interface Profile$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Profile<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Profile {
  export type walletAddress<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | walletAddress$SelectionSet<_$Scalars>;

  export interface walletAddress$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `walletAddress` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type walletAddress$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | walletAddress$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type email<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | email$SelectionSet<_$Scalars>;

  export interface email$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `email` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type email$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | email$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type settings<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = settings$SelectionSet<_$Scalars>;

  export interface settings$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Settings<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `settings` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type settings$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<settings$SelectionSet<_$Scalars>>;
}

//                                               Claim
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * User reward claims as a winner of a prediction market
 */
export interface Claim<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `sharesSpent` field on the `Claim` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  sharesSpent?:
    | Claim.sharesSpent$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Claim.sharesSpent<_$Scalars>>;
  /**
   *
   * Select the `fusdcReceived` field on the `Claim` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  fusdcReceived?:
    | Claim.fusdcReceived$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Claim.fusdcReceived<_$Scalars>>;
  /**
   *
   * Select the `winner` field on the `Claim` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  winner?:
    | Claim.winner$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Claim.winner<_$Scalars>>;
  /**
   *
   * Select the `content` field on the `Claim` object. Its type is `Campaign` (a `OutputObject` kind of type).
   *
   */
  content?:
    | Claim.content$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Claim.content<_$Scalars>>;
  /**
   *
   * Select the `createdAt` field on the `Claim` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  createdAt?:
    | Claim.createdAt$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Claim.createdAt<_$Scalars>>;
  /**
   *
   * Select the `txHash` field on the `Claim` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  txHash?:
    | Claim.txHash$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Claim.txHash<_$Scalars>>;

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
  ___?: Claim$FragmentInline<_$Scalars> | Claim$FragmentInline<_$Scalars>[];

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

export interface Claim$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Claim<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Claim {
  export type sharesSpent<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | sharesSpent$SelectionSet<_$Scalars>;

  export interface sharesSpent$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `sharesSpent` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type sharesSpent$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | sharesSpent$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type fusdcReceived<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | fusdcReceived$SelectionSet<_$Scalars>;

  export interface fusdcReceived$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `fusdcReceived` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type fusdcReceived$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | fusdcReceived$SelectionSet<_$Scalars>
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
}

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
   * Select the `liquidityVested` field on the `Campaign` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  liquidityVested?:
    | Campaign.liquidityVested$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.liquidityVested<_$Scalars>>;
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
   * Select the `isDpm` field on the `Campaign` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  isDpm?:
    | Campaign.isDpm$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.isDpm<_$Scalars>>;
  /**
   *
   * Select the `isDppm` field on the `Campaign` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  isDppm?:
    | Campaign.isDppm$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.isDppm<_$Scalars>>;
  /**
   *
   * Select the `shares` field on the `Campaign` object. Its type is `CampaignShare` (a `OutputObject` kind of type).
   *
   */
  shares?:
    | Campaign.shares$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.shares<_$Scalars>>;
  /**
   *
   * Select the `priceMetadata` field on the `Campaign` object. Its type is `PriceMetadata` (a `OutputObject` kind of type).
   *
   */
  priceMetadata?:
    | Campaign.priceMetadata$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Campaign.priceMetadata<_$Scalars>>;

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

  export type liquidityVested<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | liquidityVested$SelectionSet<_$Scalars>;

  export interface liquidityVested$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `liquidityVested` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type liquidityVested$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | liquidityVested$SelectionSet<_$Scalars>
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

  // --------------------------------------------------------------------------------------------------

  export type isDpm<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | isDpm$SelectionSet<_$Scalars>;

  export interface isDpm$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `isDpm` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type isDpm$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | isDpm$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type isDppm<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | isDppm$SelectionSet<_$Scalars>;

  export interface isDppm$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `isDppm` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type isDppm$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | isDppm$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type shares<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = shares$SelectionSet<_$Scalars>;

  export interface shares$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$CampaignShare<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `shares` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type shares$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<shares$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type priceMetadata<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = priceMetadata$SelectionSet<_$Scalars>;

  export interface priceMetadata$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$PriceMetadata<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `priceMetadata` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type priceMetadata$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<priceMetadata$SelectionSet<_$Scalars>>;
}

//                                           CampaignShare
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Campaign outcome share with identifier to match
 */
export interface CampaignShare<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `shares` field on the `CampaignShare` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  shares?:
    | CampaignShare.shares$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<CampaignShare.shares<_$Scalars>>;
  /**
   *
   * Select the `identifier` field on the `CampaignShare` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  identifier?:
    | CampaignShare.identifier$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<CampaignShare.identifier<_$Scalars>>;

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
    | CampaignShare$FragmentInline<_$Scalars>
    | CampaignShare$FragmentInline<_$Scalars>[];

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

export interface CampaignShare$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends CampaignShare<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace CampaignShare {
  export type shares<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | shares$SelectionSet<_$Scalars>;

  export interface shares$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `shares` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type shares$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | shares$SelectionSet<_$Scalars>
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
}

//                                        LeaderboardPosition
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Leaderboard position that's sent via the UI.
 */
export interface LeaderboardPosition<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `address` field on the `LeaderboardPosition` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  address?:
    | LeaderboardPosition.address$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LeaderboardPosition.address<_$Scalars>>;
  /**
   *
   * Select the `volume` field on the `LeaderboardPosition` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  volume?:
    | LeaderboardPosition.volume$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LeaderboardPosition.volume<_$Scalars>>;

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
    | LeaderboardPosition$FragmentInline<_$Scalars>
    | LeaderboardPosition$FragmentInline<_$Scalars>[];

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

export interface LeaderboardPosition$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends LeaderboardPosition<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace LeaderboardPosition {
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

  // --------------------------------------------------------------------------------------------------

  export type volume<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | volume$SelectionSet<_$Scalars>;

  export interface volume$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `volume` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type volume$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | volume$SelectionSet<_$Scalars>
  >;
}

//                                         LeaderboardWeekly
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

/**
 * Weekly leaderboard display that's sent via the leaderboard endpoint.
 */
export interface LeaderboardWeekly<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `referrers` field on the `LeaderboardWeekly` object. Its type is `LeaderboardPosition` (a `OutputObject` kind of type).
   *
   */
  referrers?:
    | LeaderboardWeekly.referrers$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LeaderboardWeekly.referrers<_$Scalars>>;
  /**
   *
   * Select the `volume` field on the `LeaderboardWeekly` object. Its type is `LeaderboardPosition` (a `OutputObject` kind of type).
   *
   */
  volume?:
    | LeaderboardWeekly.volume$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LeaderboardWeekly.volume<_$Scalars>>;
  /**
   *
   * Select the `creators` field on the `LeaderboardWeekly` object. Its type is `LeaderboardPosition` (a `OutputObject` kind of type).
   *
   */
  creators?:
    | LeaderboardWeekly.creators$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LeaderboardWeekly.creators<_$Scalars>>;

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
    | LeaderboardWeekly$FragmentInline<_$Scalars>
    | LeaderboardWeekly$FragmentInline<_$Scalars>[];

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

export interface LeaderboardWeekly$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends LeaderboardWeekly<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace LeaderboardWeekly {
  export type referrers<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = referrers$SelectionSet<_$Scalars>;

  export interface referrers$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$LeaderboardPosition<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `referrers` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type referrers$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<referrers$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type volume<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = volume$SelectionSet<_$Scalars>;

  export interface volume$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$LeaderboardPosition<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `volume` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type volume$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<volume$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type creators<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = creators$SelectionSet<_$Scalars>;

  export interface creators$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$LeaderboardPosition<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `creators` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type creators$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<creators$SelectionSet<_$Scalars>>;
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

//                                           PriceMetadata
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface PriceMetadata<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `baseAsset` field on the `PriceMetadata` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  baseAsset?:
    | PriceMetadata.baseAsset$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<PriceMetadata.baseAsset<_$Scalars>>;
  /**
   *
   * Select the `quoteAsset` field on the `PriceMetadata` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  quoteAsset?:
    | PriceMetadata.quoteAsset$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<PriceMetadata.quoteAsset<_$Scalars>>;
  /**
   *
   * Select the `priceTargetForUp` field on the `PriceMetadata` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  priceTargetForUp?:
    | PriceMetadata.priceTargetForUp$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<
        PriceMetadata.priceTargetForUp<_$Scalars>
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
    | PriceMetadata$FragmentInline<_$Scalars>
    | PriceMetadata$FragmentInline<_$Scalars>[];

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

export interface PriceMetadata$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends PriceMetadata<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace PriceMetadata {
  export type baseAsset<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | baseAsset$SelectionSet<_$Scalars>;

  export interface baseAsset$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `baseAsset` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type baseAsset$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | baseAsset$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type quoteAsset<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | quoteAsset$SelectionSet<_$Scalars>;

  export interface quoteAsset$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `quoteAsset` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type quoteAsset$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | quoteAsset$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type priceTargetForUp<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | priceTargetForUp$SelectionSet<_$Scalars>;

  export interface priceTargetForUp$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `priceTargetForUp` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type priceTargetForUp$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | priceTargetForUp$SelectionSet<_$Scalars>
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
  export type $PaymasterOperation = PaymasterOperation;
  export type $Modification = Modification;
  export type $SettlementType = SettlementType;
  export type $ActivityType = ActivityType;
  export type $OutcomeInput<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = OutcomeInput<_$Scalars>;
  export type $PriceMetadataInput<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = PriceMetadataInput<_$Scalars>;
  export type $PriceEvent<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = PriceEvent<_$Scalars>;
  export type $CommentInvestment<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = CommentInvestment<_$Scalars>;
  export type $Comment<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Comment<_$Scalars>;
  export type $LP<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = LP<_$Scalars>;
  export type $CampaignProfit<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = CampaignProfit<_$Scalars>;
  export type $Settings<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Settings<_$Scalars>;
  export type $Profile<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Profile<_$Scalars>;
  export type $Claim<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Claim<_$Scalars>;
  export type $Position<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Position<_$Scalars>;
  export type $Campaign<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Campaign<_$Scalars>;
  export type $CampaignShare<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = CampaignShare<_$Scalars>;
  export type $LeaderboardPosition<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = LeaderboardPosition<_$Scalars>;
  export type $LeaderboardWeekly<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = LeaderboardWeekly<_$Scalars>;
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
  export type $PriceMetadata<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = PriceMetadata<_$Scalars>;
}

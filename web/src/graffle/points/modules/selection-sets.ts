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
   * Select the `points` field on the `Query` object. Its type is `Points` (a `OutputObject` kind of type).
   *
   */
  points?:
    | Query.points<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.points<_$Scalars>>;
  /**
   *
   * Select the `achievements` field on the `Query` object. Its type is `Achievement` (a `OutputObject` kind of type).
   *
   */
  achievements?:
    | Query.achievements$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.achievements<_$Scalars>>;
  /**
   *
   * Select the `leaderboards` field on the `Query` object. Its type is `Leaderboard` (a `OutputObject` kind of type).
   *
   */
  leaderboards?:
    | Query.leaderboards<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.leaderboards<_$Scalars>>;
  /**
   *
   * Select the `productUserCount` field on the `Query` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  productUserCount?:
    | Query.productUserCount<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.productUserCount<_$Scalars>>;
  /**
   *
   * Select the `getPointsComponent` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  getPointsComponent?:
    | Query.getPointsComponent$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.getPointsComponent<_$Scalars>>;
  /**
   *
   * Select the `getAddressByDiscord` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  getAddressByDiscord?:
    | Query.getAddressByDiscord<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.getAddressByDiscord<_$Scalars>>;
  /**
   *
   * Select the `getDiscordName` field on the `Query` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  getDiscordName?:
    | Query.getDiscordName<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Query.getDiscordName<_$Scalars>>;

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
  export type points<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = points$SelectionSet<_$Scalars>;

  export interface points$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Points<_$Scalars> {
    /**
     * Arguments for `points` field. All arguments are required so you must include this.
     */
    $: points$Arguments<_$Scalars>;
  }

  export interface points$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    wallet: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `points` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type points$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<points$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type achievements<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = achievements$SelectionSet<_$Scalars>;

  export interface achievements$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Achievement<_$Scalars> {
    /**
     * Arguments for `achievements` field. No arguments are required so you may omit this.
     */
    $?: achievements$Arguments<_$Scalars>;
  }

  export interface achievements$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    wallet?: string | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `achievements` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type achievements$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<achievements$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type leaderboards<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = leaderboards$SelectionSet<_$Scalars>;

  export interface leaderboards$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$Leaderboard<_$Scalars> {
    /**
     * Arguments for `leaderboards` field. Some (1/2) arguments are required so you must include this.
     */
    $: leaderboards$Arguments<_$Scalars>;
  }

  export interface leaderboards$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    product: string;
    season?: number | undefined | null;
  }

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

  export type productUserCount<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = productUserCount$SelectionSet<_$Scalars>;

  export interface productUserCount$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `productUserCount` field. All arguments are required so you must include this.
     */
    $: productUserCount$Arguments<_$Scalars>;
  }

  export interface productUserCount$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    product: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `productUserCount` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type productUserCount$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<productUserCount$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type getPointsComponent<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | getPointsComponent$SelectionSet<_$Scalars>;

  export interface getPointsComponent$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `getPointsComponent` field. No arguments are required so you may omit this.
     */
    $?: getPointsComponent$Arguments<_$Scalars>;
  }

  export interface getPointsComponent$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    wallet?: string | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `getPointsComponent` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type getPointsComponent$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    | $Select.Indicator.NoArgsIndicator
    | getPointsComponent$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type getAddressByDiscord<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = getAddressByDiscord$SelectionSet<_$Scalars>;

  export interface getAddressByDiscord$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `getAddressByDiscord` field. All arguments are required so you must include this.
     */
    $: getAddressByDiscord$Arguments<_$Scalars>;
  }

  export interface getAddressByDiscord$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    addr: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `getAddressByDiscord` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type getAddressByDiscord$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<getAddressByDiscord$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type getDiscordName<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = getDiscordName$SelectionSet<_$Scalars>;

  export interface getDiscordName$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `getDiscordName` field. All arguments are required so you must include this.
     */
    $: getDiscordName$Arguments<_$Scalars>;
  }

  export interface getDiscordName$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    handle: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `getDiscordName` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type getDiscordName$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<getDiscordName$SelectionSet<_$Scalars>>;
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
   * Select the `auth` field on the `Mutation` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  auth?:
    | Mutation.auth<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.auth<_$Scalars>>;
  /**
   *
   * Select the `addAchievement` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  addAchievement?:
    | Mutation.addAchievement<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.addAchievement<_$Scalars>>;
  /**
   *
   * Select the `registerDiscord` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  registerDiscord?:
    | Mutation.registerDiscord<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.registerDiscord<_$Scalars>>;
  /**
   *
   * Select the `calculatePoints` field on the `Mutation` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  calculatePoints?:
    | Mutation.calculatePoints<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Mutation.calculatePoints<_$Scalars>>;

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
  export type auth<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = auth$SelectionSet<_$Scalars>;

  export interface auth$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `auth` field. All arguments are required so you must include this.
     */
    $: auth$Arguments<_$Scalars>;
  }

  export interface auth$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    key: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `auth` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type auth$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<auth$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type addAchievement<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = addAchievement$SelectionSet<_$Scalars>;

  export interface addAchievement$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `addAchievement` field. Some (1/4) arguments are required so you must include this.
     */
    $: addAchievement$Arguments<_$Scalars>;
  }

  export interface addAchievement$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * Wallet address to associate this achievement with.
     */
    address?: string | undefined | null;
    /**
     * Discord username to associate this achievement with. Must be address or this.
     */
    discordUsername?: string | undefined | null;
    /**
     * Name of the achievement to give.
     */
    name: string;
    /**
     * Amount of the achievement that was won.
     */
    count?: number | undefined | null;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `addAchievement` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type addAchievement$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<addAchievement$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type registerDiscord<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = registerDiscord$SelectionSet<_$Scalars>;

  export interface registerDiscord$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `registerDiscord` field. All arguments are required so you must include this.
     */
    $: registerDiscord$Arguments<_$Scalars>;
  }

  export interface registerDiscord$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    /**
     * Address owned by the Discord handle given.
     */
    address: string;
    /**
     * Discord snowflake to associate the address with.
     */
    snowflake: string;
    /**
     * Discord username to use for display from now on.
     */
    username: string;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `registerDiscord` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type registerDiscord$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<registerDiscord$SelectionSet<_$Scalars>>;

  // --------------------------------------------------------------------------------------------------

  export type calculatePoints<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = calculatePoints$SelectionSet<_$Scalars>;

  export interface calculatePoints$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {
    /**
     * Arguments for `calculatePoints` field. All arguments are required so you must include this.
     */
    $: calculatePoints$Arguments<_$Scalars>;
  }

  export interface calculatePoints$Arguments<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > {
    yes: boolean;
  }

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `calculatePoints` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type calculatePoints$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<calculatePoints$SelectionSet<_$Scalars>>;
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

//                                            Achievement
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Achievement<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `Achievement` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | Achievement.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Achievement.id<_$Scalars>>;
  /**
   *
   * Select the `name` field on the `Achievement` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  name?:
    | Achievement.name$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Achievement.name<_$Scalars>>;
  /**
   *
   * Select the `count` field on the `Achievement` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  count?:
    | Achievement.count$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Achievement.count<_$Scalars>>;
  /**
   *
   * Select the `shouldCountMatter` field on the `Achievement` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  shouldCountMatter?:
    | Achievement.shouldCountMatter$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Achievement.shouldCountMatter<_$Scalars>>;
  /**
   *
   * Select the `isCountFinancial` field on the `Achievement` object. Its type is `Boolean` (a `ScalarStandard` kind of type).
   *
   */
  isCountFinancial?:
    | Achievement.isCountFinancial$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Achievement.isCountFinancial<_$Scalars>>;
  /**
   *
   * Select the `description` field on the `Achievement` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  description?:
    | Achievement.description$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Achievement.description<_$Scalars>>;
  /**
   *
   * Select the `product` field on the `Achievement` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  product?:
    | Achievement.product$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Achievement.product<_$Scalars>>;
  /**
   *
   * Select the `season` field on the `Achievement` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  season?:
    | Achievement.season$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Achievement.season<_$Scalars>>;
  /**
   *
   * Select the `scoring` field on the `Achievement` object. Its type is `Float` (a `ScalarStandard` kind of type).
   *
   */
  scoring?:
    | Achievement.scoring$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Achievement.scoring<_$Scalars>>;

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
    | Achievement$FragmentInline<_$Scalars>
    | Achievement$FragmentInline<_$Scalars>[];

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

export interface Achievement$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Achievement<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Achievement {
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

  export type count<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | count$SelectionSet<_$Scalars>;

  export interface count$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `count` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type count$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | count$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type shouldCountMatter<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | shouldCountMatter$SelectionSet<_$Scalars>;

  export interface shouldCountMatter$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `shouldCountMatter` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type shouldCountMatter$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    | $Select.Indicator.NoArgsIndicator
    | shouldCountMatter$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type isCountFinancial<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > =
    | $Select.Indicator.NoArgsIndicator
    | isCountFinancial$SelectionSet<_$Scalars>;

  export interface isCountFinancial$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `isCountFinancial` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type isCountFinancial$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | isCountFinancial$SelectionSet<_$Scalars>
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

  export type product<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | product$SelectionSet<_$Scalars>;

  export interface product$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `product` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type product$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | product$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type season<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | season$SelectionSet<_$Scalars>;

  export interface season$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `season` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type season$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | season$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type scoring<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | scoring$SelectionSet<_$Scalars>;

  export interface scoring$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `scoring` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type scoring$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | scoring$SelectionSet<_$Scalars>
  >;
}

//                                            Leaderboard
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Leaderboard<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `Leaderboard` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | Leaderboard.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Leaderboard.id<_$Scalars>>;
  /**
   *
   * Select the `product` field on the `Leaderboard` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  product?:
    | Leaderboard.product$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Leaderboard.product<_$Scalars>>;
  /**
   *
   * Select the `items` field on the `Leaderboard` object. Its type is `LeaderboardItem` (a `OutputObject` kind of type).
   *
   */
  items?:
    | Leaderboard.items$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Leaderboard.items<_$Scalars>>;

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
    | Leaderboard$FragmentInline<_$Scalars>
    | Leaderboard$FragmentInline<_$Scalars>[];

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

export interface Leaderboard$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Leaderboard<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Leaderboard {
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

  export type product<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | product$SelectionSet<_$Scalars>;

  export interface product$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `product` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type product$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | product$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type items<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = items$SelectionSet<_$Scalars>;

  export interface items$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base,
      $NamedTypes.$LeaderboardItem<_$Scalars> {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `items` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type items$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<items$SelectionSet<_$Scalars>>;
}

//                                          LeaderboardItem
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface LeaderboardItem<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `LeaderboardItem` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | LeaderboardItem.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LeaderboardItem.id<_$Scalars>>;
  /**
   *
   * Select the `wallet` field on the `LeaderboardItem` object. Its type is `String` (a `ScalarStandard` kind of type).
   *
   */
  wallet?:
    | LeaderboardItem.wallet$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LeaderboardItem.wallet<_$Scalars>>;
  /**
   *
   * Select the `ranking` field on the `LeaderboardItem` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  ranking?:
    | LeaderboardItem.ranking$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LeaderboardItem.ranking<_$Scalars>>;
  /**
   *
   * Select the `scoring` field on the `LeaderboardItem` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  scoring?:
    | LeaderboardItem.scoring$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<LeaderboardItem.scoring<_$Scalars>>;

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
    | LeaderboardItem$FragmentInline<_$Scalars>
    | LeaderboardItem$FragmentInline<_$Scalars>[];

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

export interface LeaderboardItem$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends LeaderboardItem<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace LeaderboardItem {
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

  export type wallet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | wallet$SelectionSet<_$Scalars>;

  export interface wallet$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `wallet` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type wallet$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | wallet$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type ranking<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | ranking$SelectionSet<_$Scalars>;

  export interface ranking$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `ranking` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type ranking$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | ranking$SelectionSet<_$Scalars>
  >;

  // --------------------------------------------------------------------------------------------------

  export type scoring<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $Select.Indicator.NoArgsIndicator | scoring$SelectionSet<_$Scalars>;

  export interface scoring$SelectionSet<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > extends $Select.Bases.Base {}

  // --- expanded ---

  /**
   *
   * This is the "expanded" version of the `scoring` type. It is identical except for the fact
   * that IDEs will display its contents (a union type) directly, rather than the name of this type.
   * In some cases, this is a preferable DX, making the types easier to read for users.
   *
   */
  export type scoring$Expanded<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = $$Utilities.Simplify<
    $Select.Indicator.NoArgsIndicator | scoring$SelectionSet<_$Scalars>
  >;
}

//                                               Points
// --------------------------------------------------------------------------------------------------
//

// ----------------------------------------| Entrypoint Interface |

export interface Points<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends $Select.Bases.ObjectLike {
  /**
   *
   * Select the `id` field on the `Points` object. Its type is `ID` (a `ScalarStandard` kind of type).
   *
   */
  id?:
    | Points.id$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Points.id<_$Scalars>>;
  /**
   *
   * Select the `amount` field on the `Points` object. Its type is `Int` (a `ScalarStandard` kind of type).
   *
   */
  amount?:
    | Points.amount$Expanded<_$Scalars>
    | $Select.SelectAlias.SelectAlias<Points.amount<_$Scalars>>;

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
  ___?: Points$FragmentInline<_$Scalars> | Points$FragmentInline<_$Scalars>[];

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

export interface Points$FragmentInline<
  _$Scalars extends
    $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
> extends Points<_$Scalars>,
    $Select.Directive.$Groups.InlineFragment.Fields {}

// ----------------------------------------| Fields |

export namespace Points {
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
  export type $Achievement<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Achievement<_$Scalars>;
  export type $Leaderboard<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Leaderboard<_$Scalars>;
  export type $LeaderboardItem<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = LeaderboardItem<_$Scalars>;
  export type $Points<
    _$Scalars extends
      $$Utilities.Schema.Scalar.Registry = $$Utilities.Schema.Scalar.Registry.Empty,
  > = Points<_$Scalars>;
}

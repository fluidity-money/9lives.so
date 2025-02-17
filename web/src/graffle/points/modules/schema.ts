import * as $$Data from "./data";
import * as $$Scalar from "./scalar";
import type { Schema as $ } from "graffle/utilities-for-generated";
import type * as $$Utilities from "graffle/utilities-for-generated";

export namespace Schema {
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

  export interface Query extends $.OutputObject {
    name: "Query";
    fields: {
      __typename: Query.__typename;
      points: Query.points;
      achievements: Query.achievements;
      leaderboards: Query.leaderboards;
      productUserCount: Query.productUserCount;
      getPointsComponent: Query.getPointsComponent;
      getAddressByDiscord: Query.getAddressByDiscord;
      getDiscordName: Query.getDiscordName;
    };
  }

  export namespace Query {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Query";
      };
    }

    /**
     * Get points for the address given.
     */
    export interface points extends $.OutputField {
      name: "points";
      arguments: {
        wallet: {
          kind: "InputField";
          name: "wallet";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Points;
    }

    /**
     * Get achievements for the address given, or the category.
     * If the product is requested, then the count will be 0.
     */
    export interface achievements extends $.OutputField {
      name: "achievements";
      arguments: {
        wallet: {
          kind: "InputField";
          name: "wallet";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$Achievement;
    }

    /**
     * Gets a sorted ranking of the address * achievement count for a specific product.
     */
    export interface leaderboards extends $.OutputField {
      name: "leaderboards";
      arguments: {
        product: {
          kind: "InputField";
          name: "product";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        season: {
          kind: "InputField";
          name: "season";
          inlineType: [0];
          namedType: $$NamedTypes.$$Int;
        };
      };
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$Leaderboard;
    }

    /**
     * Number of users who used this product.
     */
    export interface productUserCount extends $.OutputField {
      name: "productUserCount";
      arguments: {
        product: {
          kind: "InputField";
          name: "product";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Returns html string with embded points data for the wallet.
     * This is a common points component to be used in every products.
     */
    export interface getPointsComponent extends $.OutputField {
      name: "getPointsComponent";
      arguments: {
        wallet: {
          kind: "InputField";
          name: "wallet";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Get a user's address using their wallet address.
     */
    export interface getAddressByDiscord extends $.OutputField {
      name: "getAddressByDiscord";
      arguments: {
        addr: {
          kind: "InputField";
          name: "addr";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Return the address associated with a Discord handle.
     * Authenticated user only.
     */
    export interface getDiscordName extends $.OutputField {
      name: "getDiscordName";
      arguments: {
        handle: {
          kind: "InputField";
          name: "handle";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                              Mutation
  // --------------------------------------------------------------------------------------------------
  //

  export interface Mutation extends $.OutputObject {
    name: "Mutation";
    fields: {
      __typename: Mutation.__typename;
      auth: Mutation.auth;
      addAchievement: Mutation.addAchievement;
      registerDiscord: Mutation.registerDiscord;
      calculatePoints: Mutation.calculatePoints;
      hideCampaign: Mutation.hideCampaign;
      setCampaignCategories: Mutation.setCampaignCategories;
    };
  }

  export namespace Mutation {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Mutation";
      };
    }

    /**
     * Authenticate with the info service using the key given. Secret string that should be set
     * with Authorization.
     */
    export interface auth extends $.OutputField {
      name: "auth";
      arguments: {
        key: {
          kind: "InputField";
          name: "key";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Add achievement for an address or Discord handle given.
     */
    export interface addAchievement extends $.OutputField {
      name: "addAchievement";
      arguments: {
        /**
         * Wallet address to associate this achievement with.
         */
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Discord username to associate this achievement with. Must be address or this.
         */
        discordUsername: {
          kind: "InputField";
          name: "discordUsername";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Name of the achievement to give.
         */
        name: {
          kind: "InputField";
          name: "name";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Amount of the achievement that was won.
         */
        count: {
          kind: "InputField";
          name: "count";
          inlineType: [0];
          namedType: $$NamedTypes.$$Int;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Register a Discord username with an address given. Does verification
     * to see if a trusted user is making this association.
     */
    export interface registerDiscord extends $.OutputField {
      name: "registerDiscord";
      arguments: {
        /**
         * Address owned by the Discord handle given.
         */
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Discord snowflake to associate the address with.
         */
        snowflake: {
          kind: "InputField";
          name: "snowflake";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Discord username to use for display from now on.
         */
        username: {
          kind: "InputField";
          name: "username";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Calculate points based on the data lake available. Does so using a function with an
     * advisory lock. Can only be used by an authenticated user sending a Authentication token.
     */
    export interface calculatePoints extends $.OutputField {
      name: "calculatePoints";
      arguments: {
        yes: {
          kind: "InputField";
          name: "yes";
          inlineType: [1];
          namedType: $$NamedTypes.$$Boolean;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Remove a campaign using special powers from the frontpage.
     */
    export interface hideCampaign extends $.OutputField {
      name: "hideCampaign";
      arguments: {
        id: {
          kind: "InputField";
          name: "id";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Adjust a campaign's categories based on its id.
     */
    export interface setCampaignCategories extends $.OutputField {
      name: "setCampaignCategories";
      arguments: {
        id: {
          kind: "InputField";
          name: "id";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        categories: {
          kind: "InputField";
          name: "categories";
          inlineType: [1, [1]];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }
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

  export interface Achievement extends $.OutputObject {
    name: "Achievement";
    fields: {
      __typename: Achievement.__typename;
      id: Achievement.id;
      name: Achievement.name;
      count: Achievement.count;
      shouldCountMatter: Achievement.shouldCountMatter;
      isCountFinancial: Achievement.isCountFinancial;
      description: Achievement.description;
      product: Achievement.product;
      season: Achievement.season;
      scoring: Achievement.scoring;
    };
  }

  export namespace Achievement {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Achievement";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    /**
     * Name of the achievement earned.
     */
    export interface name extends $.OutputField {
      name: "name";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Number of the achievement that was won. May be a unscaled number.
     */
    export interface count extends $.OutputField {
      name: "count";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Whether this achievement counts the amount of interactions with it, or its a one time
     * interaction. It might be better to not display the count of in a "this is how many
     * people have this" context if it's the former.
     */
    export interface shouldCountMatter extends $.OutputField {
      name: "shouldCountMatter";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Is the count financial? This could dissuade the UI from displaying this item if so. Or,
     * enabling some scaling functionality.
     */
    export interface isCountFinancial extends $.OutputField {
      name: "isCountFinancial";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * The descirption of this achievement.
     */
    export interface description extends $.OutputField {
      name: "description";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Product that this achievement was for.
     */
    export interface product extends $.OutputField {
      name: "product";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * The season that this achievement is for.
     */
    export interface season extends $.OutputField {
      name: "season";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * The amount of scoring for this achievement. NOTE THAT THESE ARE NOT POINTS!
     */
    export interface scoring extends $.OutputField {
      name: "scoring";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Float;
    }
  }

  //                                            Leaderboard
  // --------------------------------------------------------------------------------------------------
  //

  export interface Leaderboard extends $.OutputObject {
    name: "Leaderboard";
    fields: {
      __typename: Leaderboard.__typename;
      id: Leaderboard.id;
      product: Leaderboard.product;
      items: Leaderboard.items;
    };
  }

  export namespace Leaderboard {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Leaderboard";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    /**
     * The product this leaderboard is for. Could be 9lives or longtail.
     */
    export interface product extends $.OutputField {
      name: "product";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * The amount of items in this leaderboard.
     */
    export interface items extends $.OutputField {
      name: "items";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$LeaderboardItem;
    }
  }

  //                                          LeaderboardItem
  // --------------------------------------------------------------------------------------------------
  //

  export interface LeaderboardItem extends $.OutputObject {
    name: "LeaderboardItem";
    fields: {
      __typename: LeaderboardItem.__typename;
      id: LeaderboardItem.id;
      wallet: LeaderboardItem.wallet;
      ranking: LeaderboardItem.ranking;
      scoring: LeaderboardItem.scoring;
    };
  }

  export namespace LeaderboardItem {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "LeaderboardItem";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    /**
     * The wallet that sits in the leaderboard this way.
     */
    export interface wallet extends $.OutputField {
      name: "wallet";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * The ranking of the wallet. Ie, 1 for first place (the top).
     */
    export interface ranking extends $.OutputField {
      name: "ranking";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * The scoring of the wallet for their cumulative count achievement value.
     */
    export interface scoring extends $.OutputField {
      name: "scoring";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }
  }

  //                                               Points
  // --------------------------------------------------------------------------------------------------
  //

  export interface Points extends $.OutputObject {
    name: "Points";
    fields: {
      __typename: Points.__typename;
      id: Points.id;
      amount: Points.amount;
    };
  }

  export namespace Points {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Points";
      };
    }

    /**
     * ID of the points of the form "address"
     */
    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    /**
     * Amount of points that're given to this user so far.
     */
    export interface amount extends $.OutputField {
      name: "amount";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }
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

  //
  //
  //
  //
  //
  //
  // ==================================================================================================
  //                                             Interface
  // ==================================================================================================
  //
  //
  //
  //
  //
  //

  //
  //
  //
  //
  //
  //
  // ==================================================================================================
  //                                               Union
  // ==================================================================================================
  //
  //
  //
  //
  //
  //

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

  //
  //
  //
  //
  //
  //
  // ==================================================================================================
  //                                            ScalarCustom
  // ==================================================================================================
  //
  //
  //
  //
  //
  //

  //
  //
  //
  //
  //
  //
  // ==================================================================================================
  //                                           ScalarStandard
  // ==================================================================================================
  //
  //
  //
  //
  //
  //

  //                                              Boolean
  // --------------------------------------------------------------------------------------------------
  //

  export type Boolean = $.StandardTypes.Boolean;

  //                                               Float
  // --------------------------------------------------------------------------------------------------
  //

  export type Float = $.StandardTypes.Float;

  //                                                 ID
  // --------------------------------------------------------------------------------------------------
  //

  export type ID = $.StandardTypes.ID;

  //                                                Int
  // --------------------------------------------------------------------------------------------------
  //

  export type Int = $.StandardTypes.Int;

  //                                               String
  // --------------------------------------------------------------------------------------------------
  //

  export type String = $.StandardTypes.String;

  //
  //
  //
  //
  //
  //
  // ==================================================================================================
  //                                         Named Types Index
  // ==================================================================================================
  //
  //
  //
  //
  //
  //

  /**
   * [1] These definitions serve to allow field selection interfaces to extend their respective object type without
   *     name clashing between the field name and the object name.
   *
   *     For example imagine `Query.Foo` field with type also called `Foo`. Our generated interfaces for each field
   *     would end up with an error of `export interface Foo extends Foo ...`
   */

  namespace $$NamedTypes {
    export type $$Query = Query;
    export type $$Mutation = Mutation;
    export type $$Achievement = Achievement;
    export type $$Leaderboard = Leaderboard;
    export type $$LeaderboardItem = LeaderboardItem;
    export type $$Points = Points;
    export type $$Boolean = Boolean;
    export type $$Float = Float;
    export type $$ID = ID;
    export type $$Int = Int;
    export type $$String = String;
  }
}

//
//
//
//
//
//
// ==================================================================================================
//                                               Schema
// ==================================================================================================
//
//
//
//
//
//

export interface Schema<
  $Scalars extends $$Utilities.Schema.Scalar.Registry = $$Scalar.$Registry,
> extends $ {
  name: $$Data.Name;
  operationsAvailable: ["query", "mutation"];
  RootUnion: Schema.Query | Schema.Mutation;
  Root: {
    query: Schema.Query;
    mutation: Schema.Mutation;
    subscription: null;
  };
  allTypes: {
    Query: Schema.Query;
    Mutation: Schema.Mutation;
    Achievement: Schema.Achievement;
    Leaderboard: Schema.Leaderboard;
    LeaderboardItem: Schema.LeaderboardItem;
    Points: Schema.Points;
  };
  objects: {
    Achievement: Schema.Achievement;
    Leaderboard: Schema.Leaderboard;
    LeaderboardItem: Schema.LeaderboardItem;
    Points: Schema.Points;
  };
  unions: {};
  interfaces: {};
  scalarNamesUnion: "Boolean" | "Float" | "ID" | "Int" | "String";
  scalars: {
    Boolean: Schema.Boolean;
    Float: Schema.Float;
    ID: Schema.ID;
    Int: Schema.Int;
    String: Schema.String;
  };
  scalarRegistry: $Scalars;
  extensions: $$Utilities.GlobalRegistry.TypeExtensions;
}

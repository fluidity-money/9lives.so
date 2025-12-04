import * as $$Scalar from "./scalar";
import type * as $$Utilities from "graffle/utilities-for-generated";
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

const Boolean = $$Scalar.Boolean;

const Float = $$Scalar.Float;

const ID = $$Scalar.ID;

const Int = $$Scalar.Int;

const String = $$Scalar.String;

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

// None of your ScalarCustoms have custom scalars.

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

// None of your Enums have custom scalars.

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

// None of your InputObjects have custom scalars.

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

const Achievement: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    name: {},
    count: {},
    shouldCountMatter: {},
    isCountFinancial: {},
    description: {},
    product: {},
    season: {},
    scoring: {},
  },
};

const Leaderboard: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    product: {},
    items: {
      // nt: LeaderboardItem, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const LeaderboardItem: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    wallet: {},
    ranking: {},
    scoring: {},
  },
};

const NineLivesPoints: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    wallet: {},
    amount: {},
  },
};

const Points: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    domainName: {},
    placement: {},
    wallet: {},
    amount: {},
  },
};

const TokenHolding: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    wallet: {},
    amount: {},
  },
};

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

// None of your Interfaces have custom scalars.

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

// None of your Unions have custom scalars.

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

const Query: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    points: {
      a: {
        wallet: {
          nt: String,
          it: [1],
        },
      },
      // nt: Points, <-- Assigned later to avoid potential circular dependency.
    },
    ninelivesPoints: {
      a: {
        wallet: {
          nt: String,
          it: [1],
        },
      },
      // nt: NineLivesPoints, <-- Assigned later to avoid potential circular dependency.
    },
    leaderboard: {
      a: {
        from: {
          nt: Int,
          it: [0],
        },
        wallet: {
          nt: String,
          it: [0],
        },
      },
      // nt: Points, <-- Assigned later to avoid potential circular dependency.
    },
    achievements: {
      a: {
        wallet: {
          nt: String,
          it: [0],
        },
      },
      // nt: Achievement, <-- Assigned later to avoid potential circular dependency.
    },
    leaderboards: {
      a: {
        product: {
          nt: String,
          it: [1],
        },
        season: {
          nt: Int,
          it: [0],
        },
      },
      // nt: Leaderboard, <-- Assigned later to avoid potential circular dependency.
    },
    productUserCount: {
      a: {
        product: {
          nt: String,
          it: [1],
        },
      },
    },
    getPointsComponent: {
      a: {
        wallet: {
          nt: String,
          it: [0],
        },
      },
    },
    getAddressByDiscord: {
      a: {
        addr: {
          nt: String,
          it: [1],
        },
      },
    },
    getDiscordName: {
      a: {
        handle: {
          nt: String,
          it: [1],
        },
      },
    },
    getTokenLeaderboard: {
      a: {
        token: {
          nt: String,
          it: [1],
        },
      },
      // nt: TokenHolding, <-- Assigned later to avoid potential circular dependency.
    },
    hasBought5SimgleModeCampaigns: {
      a: {
        addr: {
          nt: String,
          it: [1],
        },
      },
    },
    hasBoughtAmm: {
      a: {
        addr: {
          nt: String,
          it: [1],
        },
      },
    },
  },
};

const Mutation: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    auth: {
      a: {
        key: {
          nt: String,
          it: [1],
        },
      },
    },
    addAchievement: {
      a: {
        address: {
          nt: String,
          it: [0],
        },
        discordUsername: {
          nt: String,
          it: [0],
        },
        name: {
          nt: String,
          it: [1],
        },
        count: {
          nt: Int,
          it: [0],
        },
      },
    },
    registerDiscord: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
        snowflake: {
          nt: String,
          it: [1],
        },
        username: {
          nt: String,
          it: [1],
        },
      },
    },
    calculatePoints: {
      a: {
        yes: {
          nt: Boolean,
          it: [1],
        },
      },
    },
    hideCampaign: {
      a: {
        id: {
          nt: String,
          it: [1],
        },
      },
    },
    setCampaignCategories: {
      a: {
        id: {
          nt: String,
          it: [1],
        },
        categories: {
          nt: String,
          it: [1, [1]],
        },
      },
    },
    requestTokensHackathon: {
      a: {
        telegram: {
          nt: String,
          it: [1],
        },
        projectName: {
          nt: String,
          it: [1],
        },
        recipientAddress: {
          nt: String,
          it: [1],
        },
        turnstileToken: {
          nt: String,
          it: [1],
        },
      },
    },
  },
};

//
//
//
//
//
//
// ==================================================================================================
//                                       Reference Assignments
//                                (avoids circular assignment issues)
// ==================================================================================================
//
//
//
//
//
//

Leaderboard.f[`items`]!.nt = LeaderboardItem;
Query.f[`points`]!.nt = Points;
Query.f[`ninelivesPoints`]!.nt = NineLivesPoints;
Query.f[`leaderboard`]!.nt = Points;
Query.f[`achievements`]!.nt = Achievement;
Query.f[`leaderboards`]!.nt = Leaderboard;
Query.f[`getTokenLeaderboard`]!.nt = TokenHolding;

//
//
//
//
//
//
// ==================================================================================================
//                                               Index
// ==================================================================================================
//
//
//
//
//
//

const $schemaDrivenDataMap: $$Utilities.SchemaDrivenDataMap = {
  operations: {
    query: Query,
    mutation: Mutation,
  },
  directives: {},
  types: {
    Boolean,
    Float,
    ID,
    Int,
    String,
    Achievement,
    Leaderboard,
    LeaderboardItem,
    NineLivesPoints,
    Points,
    TokenHolding,
    Query,
    Mutation,
  },
};

export { $schemaDrivenDataMap as schemaDrivenDataMap };

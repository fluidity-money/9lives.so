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

const String = $$Scalar.String;

const Int = $$Scalar.Int;

const Boolean = $$Scalar.Boolean;

const ID = $$Scalar.ID;

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

const Modification: $$Utilities.SchemaDrivenDataMap.Enum = {
  k: "enum",
  n: "Modification",
};

const SettlementType: $$Utilities.SchemaDrivenDataMap.Enum = {
  k: "enum",
  n: "SettlementType",
};

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

const OutcomeInput: $$Utilities.SchemaDrivenDataMap.InputObject = {
  n: "OutcomeInput",
  f: {
    name: {},
    seed: {},
    picture: {},
  },
};

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

const Campaign: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    name: {},
    description: {},
    picture: {},
    creator: {
      // nt: Wallet, <-- Assigned later to avoid potential circular dependency.
    },
    createdAt: {},
    settlement: {},
    oracleDescription: {},
    oracleUrls: {},
    identifier: {},
    poolAddress: {},
    outcomes: {
      // nt: Outcome, <-- Assigned later to avoid potential circular dependency.
    },
    starting: {},
    ending: {},
    x: {},
    telegram: {},
    web: {},
    winner: {},
    totalVolume: {},
    investmentAmounts: {
      // nt: InvestmentAmounts, <-- Assigned later to avoid potential circular dependency.
    },
    banners: {},
    categories: {},
  },
};

const InvestmentAmounts: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    usdc: {},
    share: {},
  },
};

const Outcome: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    name: {},
    picture: {},
    identifier: {},
    share: {
      // nt: Share, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const Wallet: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    address: {},
  },
};

const Share: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    address: {},
  },
};

const Changelog: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    title: {},
    afterTs: {},
    html: {},
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
    campaigns: {
      a: {
        category: {
          nt: String,
          it: [0, [1]],
        },
        orderBy: {
          nt: String,
          it: [0],
        },
        searchTerm: {
          nt: String,
          it: [0],
        },
        page: {
          nt: Int,
          it: [0],
        },
        pageSize: {
          nt: Int,
          it: [0],
        },
      },
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
    campaignById: {
      a: {
        id: {
          nt: String,
          it: [1],
        },
      },
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
    suggestedHeadlines: {},
    changelog: {
      // nt: Changelog, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const Mutation: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    explainCampaign: {
      a: {
        type: {
          nt: Modification,
          it: [1],
        },
        name: {
          nt: String,
          it: [1],
        },
        description: {
          nt: String,
          it: [1],
        },
        picture: {
          nt: String,
          it: [0],
        },
        seed: {
          nt: Int,
          it: [1],
        },
        outcomes: {
          nt: OutcomeInput,
          it: [1, [1]],
        },
        ending: {
          nt: Int,
          it: [1],
        },
        starting: {
          nt: Int,
          it: [1],
        },
        creator: {
          nt: String,
          it: [1],
        },
        oracleDescription: {
          nt: String,
          it: [0],
        },
        oracleUrls: {
          nt: String,
          it: [0, [0]],
        },
        x: {
          nt: String,
          it: [0],
        },
        telegram: {
          nt: String,
          it: [0],
        },
        web: {
          nt: String,
          it: [0],
        },
        isFake: {
          nt: Boolean,
          it: [0],
        },
      },
    },
    revealCommitment: {
      a: {
        tradingAddr: {
          nt: String,
          it: [0],
        },
        sender: {
          nt: String,
          it: [0],
        },
        seed: {
          nt: String,
          it: [0],
        },
        preferredOutcome: {
          nt: String,
          it: [0],
        },
      },
    },
    revealCommitment2: {
      a: {
        tradingAddr: {
          nt: String,
          it: [0],
        },
        sender: {
          nt: String,
          it: [0],
        },
        seed: {
          nt: String,
          it: [0],
        },
        preferredOutcome: {
          nt: String,
          it: [0],
        },
        rr: {
          nt: String,
          it: [0],
        },
        s: {
          nt: String,
          it: [0],
        },
        v: {
          nt: String,
          it: [0],
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

Campaign.f[`creator`]!.nt = Wallet;
Campaign.f[`outcomes`]!.nt = Outcome;
Campaign.f[`investmentAmounts`]!.nt = InvestmentAmounts;
Outcome.f[`share`]!.nt = Share;
Query.f[`campaigns`]!.nt = Campaign;
Query.f[`campaignById`]!.nt = Campaign;
Query.f[`changelog`]!.nt = Changelog;

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
    String,
    Int,
    Boolean,
    ID,
    Modification,
    SettlementType,
    OutcomeInput,
    Campaign,
    InvestmentAmounts,
    Outcome,
    Wallet,
    Share,
    Changelog,
    Query,
    Mutation,
  },
};

export { $schemaDrivenDataMap as schemaDrivenDataMap };

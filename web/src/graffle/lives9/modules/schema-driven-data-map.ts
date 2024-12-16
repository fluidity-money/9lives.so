import * as $$Scalar from "./scalar.js";
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
    description: {},
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
    settlement: {},
    oracleDescription: {},
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
  },
};

const Outcome: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    name: {},
    description: {},
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
          it: [1],
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
        settlement: {
          nt: SettlementType,
          it: [1],
        },
        oracleDescription: {
          nt: String,
          it: [0],
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
    Outcome,
    Wallet,
    Share,
    Changelog,
    Query,
    Mutation,
  },
};

export { $schemaDrivenDataMap as schemaDrivenDataMap };

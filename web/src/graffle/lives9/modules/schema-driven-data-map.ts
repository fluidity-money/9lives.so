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

const ID = $$Scalar.ID;

const Int = $$Scalar.Int;

const Boolean = $$Scalar.Boolean;

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

const Frontpage: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    from: {},
    until: {},
    categories: {},
    content: {
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const Campaign: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    name: {},
    description: {},
    picture: {},
    creator: {
      // nt: Wallet, <-- Assigned later to avoid potential circular dependency.
    },
    oracle: {},
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
    frontpage: {
      a: {
        category: {
          nt: String,
          it: [0, [1]],
        },
      },
      // nt: Frontpage, <-- Assigned later to avoid potential circular dependency.
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

Frontpage.f[`content`]!.nt = Campaign;
Campaign.f[`creator`]!.nt = Wallet;
Campaign.f[`outcomes`]!.nt = Outcome;
Outcome.f[`share`]!.nt = Share;
Query.f[`campaigns`]!.nt = Campaign;
Query.f[`frontpage`]!.nt = Frontpage;
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
    ID,
    Int,
    Boolean,
    Modification,
    OutcomeInput,
    Frontpage,
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

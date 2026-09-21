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

const ID = $$Scalar.ID;

const String = $$Scalar.String;

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

const Outcome: $$Utilities.SchemaDrivenDataMap.Enum = {
  k: "enum",
  n: "Outcome",
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

const CreateAccount: $$Utilities.SchemaDrivenDataMap.InputObject = {
  n: "CreateAccount",
  f: {
    eoa_addr: {},
    sigV: {},
    sigR: {},
    sigS: {},
    authority: {},
  },
};

const Permit: $$Utilities.SchemaDrivenDataMap.InputObject = {
  n: "Permit",
  f: {
    deadline: {},
    permitV: {},
    permitR: {},
    permitS: {},
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

const OpenAuction: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    openToBeWon: {},
    accAddr: {},
    deadlineTs: {},
    outcome: {},
    expiryTs: {},
    priceTarget: {},
    isUp: {},
    bundleTakerId: {},
  },
};

const OpenAuctions: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    openAuctions: {
      // nt: OpenAuction, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const AuctionCreatedResult: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    leftoverBal: {},
    amountSpent: {},
    bundleId: {},
  },
};

const BundleMakerInfo: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    bundleMakerId: {},
  },
};

const BundleTakerOwnerStatus: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    concluded: {},
    cancelled: {},
    earned: {},
  },
};

const AggregateBundleTaker: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
  },
};

const AggregateBundleMaker: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
  },
};

const Aggregate: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    takerWon: {},
    bundleTaker: {
      // nt: AggregateBundleTaker, <-- Assigned later to avoid potential circular dependency.
    },
    bundleMaker: {
      // nt: AggregateBundleMaker, <-- Assigned later to avoid potential circular dependency.
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
    balance: {
      a: {
        addr: {
          nt: String,
          it: [1],
        },
      },
    },
    openAuctions: {
      // nt: OpenAuctions, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const Mutation: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    createAccountExec: {
      a: {
        createAccount: {
          nt: CreateAccount,
          it: [1],
        },
        permit: {
          nt: Permit,
          it: [0],
        },
        amt: {
          nt: String,
          it: [1],
        },
        isDryrun: {
          nt: Boolean,
          it: [0],
        },
      },
    },
    onrampAmount: {
      a: {
        amt: {
          nt: String,
          it: [1],
        },
        permit: {
          nt: Permit,
          it: [0],
        },
        isDryrun: {
          nt: Boolean,
          it: [0],
        },
      },
    },
    createAuctionFromOnrampedAmountServerSig: {
      a: {
        minAmount: {
          nt: String,
          it: [1],
        },
        maxAmount: {
          nt: String,
          it: [1],
        },
        isUp: {
          nt: Boolean,
          it: [1],
        },
        priceTarget: {
          nt: String,
          it: [1],
        },
        outcome: {
          nt: Outcome,
          it: [1],
        },
        expiry: {
          nt: Int,
          it: [1],
        },
        deadline: {
          nt: Int,
          it: [1],
        },
        minOffer: {
          nt: String,
          it: [1],
        },
      },
      // nt: AuctionCreatedResult, <-- Assigned later to avoid potential circular dependency.
    },
    inspectBundleTakerId: {
      a: {
        bundleTakerId: {
          nt: Int,
          it: [1],
        },
      },
      // nt: BundleTakerOwnerStatus, <-- Assigned later to avoid potential circular dependency.
    },
    concludeAndAggregate: {
      a: {
        bundleTakerId: {
          nt: Int,
          it: [1],
        },
      },
      // nt: Aggregate, <-- Assigned later to avoid potential circular dependency.
    },
    cancelAuction: {
      a: {
        bundleTakerId: {
          nt: Int,
          it: [1],
        },
      },
    },
    submitBundleMakerFromOnrampedAmountServerSig: {
      a: {
        bundleTakerId: {
          nt: Int,
          it: [1],
        },
        minAmount: {
          nt: String,
          it: [1],
        },
        maxAmount: {
          nt: String,
          it: [1],
        },
      },
      // nt: BundleMakerInfo, <-- Assigned later to avoid potential circular dependency.
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

OpenAuctions.f[`openAuctions`]!.nt = OpenAuction;
Aggregate.f[`bundleTaker`]!.nt = AggregateBundleTaker;
Aggregate.f[`bundleMaker`]!.nt = AggregateBundleMaker;
Query.f[`openAuctions`]!.nt = OpenAuctions;
Mutation.f[`createAuctionFromOnrampedAmountServerSig`]!.nt =
  AuctionCreatedResult;
Mutation.f[`inspectBundleTakerId`]!.nt = BundleTakerOwnerStatus;
Mutation.f[`concludeAndAggregate`]!.nt = Aggregate;
Mutation.f[`submitBundleMakerFromOnrampedAmountServerSig`]!.nt =
  BundleMakerInfo;

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
    ID,
    String,
    Int,
    Boolean,
    Outcome,
    CreateAccount,
    Permit,
    OpenAuction,
    OpenAuctions,
    AuctionCreatedResult,
    BundleMakerInfo,
    BundleTakerOwnerStatus,
    AggregateBundleTaker,
    AggregateBundleMaker,
    Aggregate,
    Query,
    Mutation,
  },
};

export { $schemaDrivenDataMap as schemaDrivenDataMap };

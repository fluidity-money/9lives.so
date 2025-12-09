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

const CreateAccount: $$Utilities.SchemaDrivenDataMap.InputObject = {
  n: "CreateAccount",
  f: {
    eoa_addr: {},
    sigV: {},
    sigR: {},
    sigS: {},
  },
};

const FromArgs: $$Utilities.SchemaDrivenDataMap.InputObject = {
  n: "FromArgs",
  f: {
    token: {},
    to_take: {},
    max_unspent: {},
  },
};

const Mint: $$Utilities.SchemaDrivenDataMap.InputObject = {
  n: "Mint",
  f: {
    market: {},
    outcome: {},
    amount: {},
    permit: {},
    referrer: {},
    ms_ts: {},
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

const SolveArgs: $$Utilities.SchemaDrivenDataMap.InputObject = {
  n: "SolveArgs",
  f: {
    permit: {},
    from: {},
    target: {},
    cd: {},
    ms_ts: {},
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

const CreateAccountExec: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    hash: {},
    secret: {},
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
    publickey: {},
    eoaForAddress: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
      },
    },
    hasCreated: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
      },
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
        mint: {
          nt: Mint,
          it: [0],
        },
      },
      // nt: CreateAccountExec, <-- Assigned later to avoid potential circular dependency.
    },
    requestSecret: {
      a: {
        eoa_addr: {
          nt: String,
          it: [1],
        },
        nonce: {
          nt: Int,
          it: [1],
        },
        sigV: {
          nt: Int,
          it: [1],
        },
        sigR: {
          nt: String,
          it: [1],
        },
        sigS: {
          nt: String,
          it: [1],
        },
      },
    },
    ninelivesMint: {
      a: {
        mint: {
          nt: Mint,
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

Mutation.f[`createAccountExec`]!.nt = CreateAccountExec;

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
    CreateAccount,
    FromArgs,
    Mint,
    Permit,
    SolveArgs,
    CreateAccountExec,
    Query,
    Mutation,
  },
};

export { $schemaDrivenDataMap as schemaDrivenDataMap };

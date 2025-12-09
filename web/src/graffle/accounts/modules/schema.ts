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
      publickey: Query.publickey;
      eoaForAddress: Query.eoaForAddress;
      hasCreated: Query.hasCreated;
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
     * Get the system management ed25519 public key this server is managing. Useful for the
     * signing process.
     */
    export interface publickey extends $.OutputField {
      name: "publickey";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface eoaForAddress extends $.OutputField {
      name: "eoaForAddress";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Is this address recorded as having onramped?
     */
    export interface hasCreated extends $.OutputField {
      name: "hasCreated";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }
  }

  //                                              Mutation
  // --------------------------------------------------------------------------------------------------
  //

  export interface Mutation extends $.OutputObject {
    name: "Mutation";
    fields: {
      __typename: Mutation.__typename;
      createAccountExec: Mutation.createAccountExec;
      requestSecret: Mutation.requestSecret;
      ninelivesMint: Mutation.ninelivesMint;
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
     * Create a new account using the key management service intended for API workers. Returns
     * a secret key that can be used to spend from the account.
     */
    export interface createAccountExec extends $.OutputField {
      name: "createAccountExec";
      arguments: {
        createAccount: {
          kind: "InputField";
          name: "createAccount";
          inlineType: [1];
          namedType: $$NamedTypes.$$CreateAccount;
        };
        mint: {
          kind: "InputField";
          name: "mint";
          inlineType: [0];
          namedType: $$NamedTypes.$$Mint;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$CreateAccountExec;
    }

    /**
     * Request the existing secret that was created for this account. It needs a signature of
     * the nonce and the public key from the user. The nonce must be greater than what's
     * recorded in the database so far.
     */
    export interface requestSecret extends $.OutputField {
      name: "requestSecret";
      arguments: {
        eoa_addr: {
          kind: "InputField";
          name: "eoa_addr";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        nonce: {
          kind: "InputField";
          name: "nonce";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        sigV: {
          kind: "InputField";
          name: "sigV";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        sigR: {
          kind: "InputField";
          name: "sigR";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        sigS: {
          kind: "InputField";
          name: "sigS";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Use 9lives to open a position on behalf of the user given, optiomally creating the
     * account at the same time. The EOA is fetched from the secret key that the
     * user passes to the client.
     */
    export interface ninelivesMint extends $.OutputField {
      name: "ninelivesMint";
      arguments: {
        mint: {
          kind: "InputField";
          name: "mint";
          inlineType: [1];
          namedType: $$NamedTypes.$$Mint;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
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

  //                                         CreateAccountExec
  // --------------------------------------------------------------------------------------------------
  //

  export interface CreateAccountExec extends $.OutputObject {
    name: "CreateAccountExec";
    fields: {
      __typename: CreateAccountExec.__typename;
      hash: CreateAccountExec.hash;
      secret: CreateAccountExec.secret;
    };
  }

  export namespace CreateAccountExec {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "CreateAccountExec";
      };
    }

    export interface hash extends $.OutputField {
      name: "hash";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface secret extends $.OutputField {
      name: "secret";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
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

  //                                           CreateAccount
  // --------------------------------------------------------------------------------------------------
  //

  export interface CreateAccount extends $.InputObject {
    name: "CreateAccount";
    isAllFieldsNullable: false;
    fields: {
      eoa_addr: CreateAccount.eoa_addr;
      sigV: CreateAccount.sigV;
      sigR: CreateAccount.sigR;
      sigS: CreateAccount.sigS;
    };
  }

  export namespace CreateAccount {
    export interface eoa_addr extends $.InputField {
      name: "eoa_addr";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface sigV extends $.InputField {
      name: "sigV";
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    export interface sigR extends $.InputField {
      name: "sigR";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface sigS extends $.InputField {
      name: "sigS";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                              FromArgs
  // --------------------------------------------------------------------------------------------------
  //

  export interface FromArgs extends $.InputObject {
    name: "FromArgs";
    isAllFieldsNullable: false;
    fields: {
      token: FromArgs.token;
      to_take: FromArgs.to_take;
      max_unspent: FromArgs.max_unspent;
    };
  }

  export namespace FromArgs {
    export interface token extends $.InputField {
      name: "token";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface to_take extends $.InputField {
      name: "to_take";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface max_unspent extends $.InputField {
      name: "max_unspent";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                                Mint
  // --------------------------------------------------------------------------------------------------
  //

  export interface Mint extends $.InputObject {
    name: "Mint";
    isAllFieldsNullable: true;
    fields: {
      market: Mint.market;
      outcome: Mint.outcome;
      amount: Mint.amount;
      permit: Mint.permit;
      referrer: Mint.referrer;
      ms_ts: Mint.ms_ts;
    };
  }

  export namespace Mint {
    export interface market extends $.InputField {
      name: "market";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface outcome extends $.InputField {
      name: "outcome";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface amount extends $.InputField {
      name: "amount";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface permit extends $.InputField {
      name: "permit";
      inlineType: [0];
      namedType: $$NamedTypes.$$Permit;
    }

    export interface referrer extends $.InputField {
      name: "referrer";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * The millisecond timestamp for making sure this isn't doubled up somehow.
     */
    export interface ms_ts extends $.InputField {
      name: "ms_ts";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                               Permit
  // --------------------------------------------------------------------------------------------------
  //

  export interface Permit extends $.InputObject {
    name: "Permit";
    isAllFieldsNullable: false;
    fields: {
      deadline: Permit.deadline;
      permitV: Permit.permitV;
      permitR: Permit.permitR;
      permitS: Permit.permitS;
    };
  }

  export namespace Permit {
    export interface deadline extends $.InputField {
      name: "deadline";
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    export interface permitV extends $.InputField {
      name: "permitV";
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    export interface permitR extends $.InputField {
      name: "permitR";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface permitS extends $.InputField {
      name: "permitS";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                             SolveArgs
  // --------------------------------------------------------------------------------------------------
  //

  export interface SolveArgs extends $.InputObject {
    name: "SolveArgs";
    isAllFieldsNullable: false;
    fields: {
      permit: SolveArgs.permit;
      from: SolveArgs.from;
      target: SolveArgs.target;
      cd: SolveArgs.cd;
      ms_ts: SolveArgs.ms_ts;
    };
  }

  export namespace SolveArgs {
    export interface permit extends $.InputField {
      name: "permit";
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$Permit;
    }

    export interface from extends $.InputField {
      name: "from";
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$FromArgs;
    }

    export interface target extends $.InputField {
      name: "target";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface cd extends $.InputField {
      name: "cd";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface ms_ts extends $.InputField {
      name: "ms_ts";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }
  }

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
    export type $$CreateAccountExec = CreateAccountExec;
    export type $$CreateAccount = CreateAccount;
    export type $$FromArgs = FromArgs;
    export type $$Mint = Mint;
    export type $$Permit = Permit;
    export type $$SolveArgs = SolveArgs;
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
    CreateAccountExec: Schema.CreateAccountExec;
  };
  objects: {
    CreateAccountExec: Schema.CreateAccountExec;
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

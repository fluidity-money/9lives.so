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
      balance: Query.balance;
      openAuctions: Query.openAuctions;
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
     * Get the balance that can be spent after it was onramped.
     */
    export interface balance extends $.OutputField {
      name: "balance";
      arguments: {
        addr: {
          kind: "InputField";
          name: "addr";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Currently outstanding auctions that need a user to submit BundleMakers.
     */
    export interface openAuctions extends $.OutputField {
      name: "openAuctions";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$OpenAuctions;
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
      onrampAmount: Mutation.onrampAmount;
      createAuctionFromOnrampedAmountServerSig: Mutation.createAuctionFromOnrampedAmountServerSig;
      inspectBundleTakerId: Mutation.inspectBundleTakerId;
      concludeAndAggregate: Mutation.concludeAndAggregate;
      cancelAuction: Mutation.cancelAuction;
      submitBundleMakerFromOnrampedAmountServerSig: Mutation.submitBundleMakerFromOnrampedAmountServerSig;
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
     * Create an account while onramping from bal to create a balance object.
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
        permit: {
          kind: "InputField";
          name: "permit";
          inlineType: [0];
          namedType: $$NamedTypes.$$Permit;
        };
        amt: {
          kind: "InputField";
          name: "amt";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        isDryrun: {
          kind: "InputField";
          name: "isDryrun";
          inlineType: [0];
          namedType: $$NamedTypes.$$Boolean;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Onramp an amount using the router.
     */
    export interface onrampAmount extends $.OutputField {
      name: "onrampAmount";
      arguments: {
        amt: {
          kind: "InputField";
          name: "amt";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        permit: {
          kind: "InputField";
          name: "permit";
          inlineType: [0];
          namedType: $$NamedTypes.$$Permit;
        };
        isDryrun: {
          kind: "InputField";
          name: "isDryrun";
          inlineType: [0];
          namedType: $$NamedTypes.$$Boolean;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Create an BundleTaker auction, and starting to receive BundleMaker combinations. Use the
     * server provided signature for an account that's managed by the server instead of
     * validating a signature and an amount.
     */
    export interface createAuctionFromOnrampedAmountServerSig
      extends $.OutputField {
      name: "createAuctionFromOnrampedAmountServerSig";
      arguments: {
        /**
         * The minimum amount of the outstanding balance we can spend here.
         */
        minAmount: {
          kind: "InputField";
          name: "minAmount";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * "
         * The maximum amount to take from the available onramped liquidity.
         */
        maxAmount: {
          kind: "InputField";
          name: "maxAmount";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        isUp: {
          kind: "InputField";
          name: "isUp";
          inlineType: [1];
          namedType: $$NamedTypes.$$Boolean;
        };
        priceTarget: {
          kind: "InputField";
          name: "priceTarget";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        outcome: {
          kind: "InputField";
          name: "outcome";
          inlineType: [1];
          namedType: $$NamedTypes.$$Outcome;
        };
        /**
         * The timestamp that we use for expiry of the market.
         */
        expiry: {
          kind: "InputField";
          name: "expiry";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        /**
         * Deadline for any offers coming in. Orders can only be placed before this ends.
         */
        deadline: {
          kind: "InputField";
          name: "deadline";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        /**
         * Minimum offer of amount to take from the Maker in exchange for this liquidity.
         */
        minOffer: {
          kind: "InputField";
          name: "minOffer";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$AuctionCreatedResult;
    }

    /**
     * Get status that's relevant for the submitter of the BundleTaker. The only caller is the
     * owner of the Bundle. Atomic in that the function that inspects information on this is
     * the acc_addr that we filter for.
     */
    export interface inspectBundleTakerId extends $.OutputField {
      name: "inspectBundleTakerId";
      arguments: {
        bundleTakerId: {
          kind: "InputField";
          name: "bundleTakerId";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$BundleTakerOwnerStatus;
    }

    /**
     * Permanently mark one side of the Aggregate bundle as consumed, and receive a server
     * signature for the Aggregate. Automatically decides if you're the taker or the maker,
     * and gives you results relevant to that.
     */
    export interface concludeAndAggregate extends $.OutputField {
      name: "concludeAndAggregate";
      arguments: {
        bundleTakerId: {
          kind: "InputField";
          name: "bundleTakerId";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Aggregate;
    }

    /**
     * Cancel an auction, using the taker id to do so. Only possible to be invoked by the
     * creator of the auction. It's only possible to cancel the auction if it's within the
     * one minute window of the market existing.
     */
    export interface cancelAuction extends $.OutputField {
      name: "cancelAuction";
      arguments: {
        bundleTakerId: {
          kind: "InputField";
          name: "bundleTakerId";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Submit a BundleMaker from the liquidity we have here using a server signature and an
     * onramped amount. The BundleMaker is not necessarily consumed unless it's chosen at
     * the end of the BundleTaker's life by the server or by the end user, depending on
     * the Taker's strategy for choosing. The BundleMaker here will take the opposite
     * position of the BundleTaker.
     */
    export interface submitBundleMakerFromOnrampedAmountServerSig
      extends $.OutputField {
      name: "submitBundleMakerFromOnrampedAmountServerSig";
      arguments: {
        /**
         * The bundle taker to point to to make this interaction work.
         */
        bundleTakerId: {
          kind: "InputField";
          name: "bundleTakerId";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        /**
         * The minimum amount of the outstanding balance we can spend here.
         */
        minAmount: {
          kind: "InputField";
          name: "minAmount";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * "
         * The maximum amount to take from the available onramped liquidity.
         */
        maxAmount: {
          kind: "InputField";
          name: "maxAmount";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$BundleMakerInfo;
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

  //                                            OpenAuction
  // --------------------------------------------------------------------------------------------------
  //

  export interface OpenAuction extends $.OutputObject {
    name: "OpenAuction";
    fields: {
      __typename: OpenAuction.__typename;
      id: OpenAuction.id;
      openToBeWon: OpenAuction.openToBeWon;
      accAddr: OpenAuction.accAddr;
      deadlineTs: OpenAuction.deadlineTs;
      outcome: OpenAuction.outcome;
      expiryTs: OpenAuction.expiryTs;
      priceTarget: OpenAuction.priceTarget;
      isUp: OpenAuction.isUp;
      bundleTakerId: OpenAuction.bundleTakerId;
    };
  }

  export namespace OpenAuction {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "OpenAuction";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    /**
     * Open to be won if this user is predicting incorrectly.
     */
    export interface openToBeWon extends $.OutputField {
      name: "openToBeWon";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Owner's acc addr.
     */
    export interface accAddr extends $.OutputField {
      name: "accAddr";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Timestamp for then this bundle is considered unfilled if no-one applies with an ask.
     */
    export interface deadlineTs extends $.OutputField {
      name: "deadlineTs";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Outcome that's being predicted against.
     */
    export interface outcome extends $.OutputField {
      name: "outcome";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Outcome;
    }

    /**
     * Expiry for when this is considered safe to execute.
     */
    export interface expiryTs extends $.OutputField {
      name: "expiryTs";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Price target denominated as a integer.
     */
    export interface priceTarget extends $.OutputField {
      name: "priceTarget";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Whether this position predicted that the outcome would go up or down.
     */
    export interface isUp extends $.OutputField {
      name: "isUp";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * ID that lets you address this bundle when making a request.
     */
    export interface bundleTakerId extends $.OutputField {
      name: "bundleTakerId";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }
  }

  //                                            OpenAuctions
  // --------------------------------------------------------------------------------------------------
  //

  export interface OpenAuctions extends $.OutputObject {
    name: "OpenAuctions";
    fields: {
      __typename: OpenAuctions.__typename;
      id: OpenAuctions.id;
      openAuctions: OpenAuctions.openAuctions;
    };
  }

  export namespace OpenAuctions {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "OpenAuctions";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    export interface openAuctions extends $.OutputField {
      name: "openAuctions";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$OpenAuction;
    }
  }

  //                                        AuctionCreatedResult
  // --------------------------------------------------------------------------------------------------
  //

  export interface AuctionCreatedResult extends $.OutputObject {
    name: "AuctionCreatedResult";
    fields: {
      __typename: AuctionCreatedResult.__typename;
      leftoverBal: AuctionCreatedResult.leftoverBal;
      amountSpent: AuctionCreatedResult.amountSpent;
      bundleId: AuctionCreatedResult.bundleId;
    };
  }

  export namespace AuctionCreatedResult {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "AuctionCreatedResult";
      };
    }

    /**
     * Leftover amount that can still be spent by this user.
     */
    export interface leftoverBal extends $.OutputField {
      name: "leftoverBal";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * The amount that was spent in the creation of this auction.
     */
    export interface amountSpent extends $.OutputField {
      name: "amountSpent";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * The BundleTaker identifier for use soon.
     */
    export interface bundleId extends $.OutputField {
      name: "bundleId";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }
  }

  //                                          BundleMakerInfo
  // --------------------------------------------------------------------------------------------------
  //

  export interface BundleMakerInfo extends $.OutputObject {
    name: "BundleMakerInfo";
    fields: {
      __typename: BundleMakerInfo.__typename;
      id: BundleMakerInfo.id;
      bundleMakerId: BundleMakerInfo.bundleMakerId;
    };
  }

  export namespace BundleMakerInfo {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "BundleMakerInfo";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    /**
     * The Identifier for the BundleMaker that we can refer to later to determine if it will be
     * included. Maker offers cannot be cancelled.
     */
    export interface bundleMakerId extends $.OutputField {
      name: "bundleMakerId";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }
  }

  //                                       BundleTakerOwnerStatus
  // --------------------------------------------------------------------------------------------------
  //

  export interface BundleTakerOwnerStatus extends $.OutputObject {
    name: "BundleTakerOwnerStatus";
    fields: {
      __typename: BundleTakerOwnerStatus.__typename;
      id: BundleTakerOwnerStatus.id;
      concluded: BundleTakerOwnerStatus.concluded;
      cancelled: BundleTakerOwnerStatus.cancelled;
      earned: BundleTakerOwnerStatus.earned;
    };
  }

  export namespace BundleTakerOwnerStatus {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "BundleTakerOwnerStatus";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    /**
     * Was this BundleTaker matched to anyone?
     */
    export interface concluded extends $.OutputField {
      name: "concluded";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Was this BundleTaker cancelled?
     */
    export interface cancelled extends $.OutputField {
      name: "cancelled";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * The amount earned from the BundleTaker being matched with a BundleMaker, if any.
     */
    export interface earned extends $.OutputField {
      name: "earned";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                        AggregateBundleTaker
  // --------------------------------------------------------------------------------------------------
  //

  export interface AggregateBundleTaker extends $.OutputObject {
    name: "AggregateBundleTaker";
    fields: {
      __typename: AggregateBundleTaker.__typename;
      id: AggregateBundleTaker.id;
    };
  }

  export namespace AggregateBundleTaker {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "AggregateBundleTaker";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }
  }

  //                                        AggregateBundleMaker
  // --------------------------------------------------------------------------------------------------
  //

  export interface AggregateBundleMaker extends $.OutputObject {
    name: "AggregateBundleMaker";
    fields: {
      __typename: AggregateBundleMaker.__typename;
      id: AggregateBundleMaker.id;
    };
  }

  export namespace AggregateBundleMaker {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "AggregateBundleMaker";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }
  }

  //                                             Aggregate
  // --------------------------------------------------------------------------------------------------
  //

  export interface Aggregate extends $.OutputObject {
    name: "Aggregate";
    fields: {
      __typename: Aggregate.__typename;
      id: Aggregate.id;
      takerWon: Aggregate.takerWon;
      bundleTaker: Aggregate.bundleTaker;
      bundleMaker: Aggregate.bundleMaker;
    };
  }

  export namespace Aggregate {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Aggregate";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    export interface takerWon extends $.OutputField {
      name: "takerWon";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Boolean;
    }

    export interface bundleTaker extends $.OutputField {
      name: "bundleTaker";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$AggregateBundleTaker;
    }

    export interface bundleMaker extends $.OutputField {
      name: "bundleMaker";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$AggregateBundleMaker;
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
    isAllFieldsNullable: true;
    fields: {
      eoa_addr: CreateAccount.eoa_addr;
      sigV: CreateAccount.sigV;
      sigR: CreateAccount.sigR;
      sigS: CreateAccount.sigS;
      authority: CreateAccount.authority;
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

    export interface authority extends $.InputField {
      name: "authority";
      inlineType: [0];
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

  //                                              Outcome
  // --------------------------------------------------------------------------------------------------
  //

  export interface Outcome extends $.Enum {
    name: "Outcome";
    members: ["BitcoinPrice"];
    membersUnion: "BitcoinPrice";
  }

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

  //                                                 ID
  // --------------------------------------------------------------------------------------------------
  //

  export type ID = $.StandardTypes.ID;

  //                                               String
  // --------------------------------------------------------------------------------------------------
  //

  export type String = $.StandardTypes.String;

  //                                                Int
  // --------------------------------------------------------------------------------------------------
  //

  export type Int = $.StandardTypes.Int;

  //                                              Boolean
  // --------------------------------------------------------------------------------------------------
  //

  export type Boolean = $.StandardTypes.Boolean;

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
    export type $$OpenAuction = OpenAuction;
    export type $$OpenAuctions = OpenAuctions;
    export type $$AuctionCreatedResult = AuctionCreatedResult;
    export type $$BundleMakerInfo = BundleMakerInfo;
    export type $$BundleTakerOwnerStatus = BundleTakerOwnerStatus;
    export type $$AggregateBundleTaker = AggregateBundleTaker;
    export type $$AggregateBundleMaker = AggregateBundleMaker;
    export type $$Aggregate = Aggregate;
    export type $$CreateAccount = CreateAccount;
    export type $$Permit = Permit;
    export type $$Outcome = Outcome;
    export type $$ID = ID;
    export type $$String = String;
    export type $$Int = Int;
    export type $$Boolean = Boolean;
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
    Outcome: Schema.Outcome;
    OpenAuction: Schema.OpenAuction;
    OpenAuctions: Schema.OpenAuctions;
    AuctionCreatedResult: Schema.AuctionCreatedResult;
    BundleMakerInfo: Schema.BundleMakerInfo;
    BundleTakerOwnerStatus: Schema.BundleTakerOwnerStatus;
    AggregateBundleTaker: Schema.AggregateBundleTaker;
    AggregateBundleMaker: Schema.AggregateBundleMaker;
    Aggregate: Schema.Aggregate;
  };
  objects: {
    OpenAuction: Schema.OpenAuction;
    OpenAuctions: Schema.OpenAuctions;
    AuctionCreatedResult: Schema.AuctionCreatedResult;
    BundleMakerInfo: Schema.BundleMakerInfo;
    BundleTakerOwnerStatus: Schema.BundleTakerOwnerStatus;
    AggregateBundleTaker: Schema.AggregateBundleTaker;
    AggregateBundleMaker: Schema.AggregateBundleMaker;
    Aggregate: Schema.Aggregate;
  };
  unions: {};
  interfaces: {};
  scalarNamesUnion: "ID" | "String" | "Int" | "Boolean";
  scalars: {
    ID: Schema.ID;
    String: Schema.String;
    Int: Schema.Int;
    Boolean: Schema.Boolean;
  };
  scalarRegistry: $Scalars;
  extensions: $$Utilities.GlobalRegistry.TypeExtensions;
}

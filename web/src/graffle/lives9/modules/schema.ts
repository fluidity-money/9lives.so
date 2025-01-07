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
      campaigns: Query.campaigns;
      campaignById: Query.campaignById;
      suggestedHeadlines: Query.suggestedHeadlines;
      changelog: Query.changelog;
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
     * Campaign List that can be filtered according to categories
     */
    export interface campaigns extends $.OutputField {
      name: "campaigns";
      arguments: {
        category: {
          kind: "InputField";
          name: "category";
          inlineType: [0, [1]];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$Campaign;
    }

    /**
     * Get a campaign by its ID. May or may not exist.
     */
    export interface campaignById extends $.OutputField {
      name: "campaignById";
      arguments: {
        id: {
          kind: "InputField";
          name: "id";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$Campaign;
    }

    /**
     * Suggested headlines for the day based on AI input.
     */
    export interface suggestedHeadlines extends $.OutputField {
      name: "suggestedHeadlines";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Any new changelog items that have come up recently.
     */
    export interface changelog extends $.OutputField {
      name: "changelog";
      arguments: {};
      inlineType: [1, [0]];
      namedType: $$NamedTypes.$$Changelog;
    }
  }

  //                                              Mutation
  // --------------------------------------------------------------------------------------------------
  //

  export interface Mutation extends $.OutputObject {
    name: "Mutation";
    fields: {
      __typename: Mutation.__typename;
      explainCampaign: Mutation.explainCampaign;
      revealCommitment: Mutation.revealCommitment;
      revealCommitment2: Mutation.revealCommitment2;
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
     * "Explain" a campaign, so an on-chain campaign creation is listed in the frontend.
     * Campaign is then spooled in a would-be frontend aggregation table.
     */
    export interface explainCampaign extends $.OutputField {
      name: "explainCampaign";
      arguments: {
        /**
         * Type of the modification to the campaign explanation.
         */
        type: {
          kind: "InputField";
          name: "type";
          inlineType: [1];
          namedType: $$NamedTypes.$$Modification;
        };
        /**
         * Name of the campaign.
         */
        name: {
          kind: "InputField";
          name: "name";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Description of the campaign.
         */
        description: {
          kind: "InputField";
          name: "description";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Picture of the campaign.
         */
        picture: {
          kind: "InputField";
          name: "picture";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Randomly chosen seed for the creation of the identifier.
         */
        seed: {
          kind: "InputField";
          name: "seed";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        /**
         * Outcomes associated with this campaign. An outcome can either be something like
         * Trump winning the election, or something else.
         */
        outcomes: {
          kind: "InputField";
          name: "outcomes";
          inlineType: [1, [1]];
          namedType: $$NamedTypes.$$OutcomeInput;
        };
        /**
         * Expected ending timestamp.
         */
        ending: {
          kind: "InputField";
          name: "ending";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        /**
         * Expected starting timestamp.
         */
        starting: {
          kind: "InputField";
          name: "starting";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        /**
         * Creator address. Hex encoded. Verified to be the creator later.
         */
        creator: {
          kind: "InputField";
          name: "creator";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Oracle description defines under which conditions campaigns conclude if infra market
         * used as settlement source.
         */
        oracleDescription: {
          kind: "InputField";
          name: "oracleDescription";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Oracle URLs are helper sources for documents when the infrastructure market is used as
         * a settlement source.
         */
        oracleUrls: {
          kind: "InputField";
          name: "oracleUrls";
          inlineType: [0, [0]];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * X/Twitter username
         */
        x: {
          kind: "InputField";
          name: "x";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Telegram username
         */
        telegram: {
          kind: "InputField";
          name: "telegram";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Web url
         */
        web: {
          kind: "InputField";
          name: "web";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Reveal a commitment, including a hash, to the server. It's okay for us to be
     * permissive with the input that we accept, since a sophisticated worker will simulate
     * these calls to identify the correct approach for submitting on behalf of a user. If
     * a user were to spam submissions, the impact would be negligible thankfully. However,
     * in those degraded scenarios where we pass 10 submissions, in the calling of this
     * function, it's possible for the backend to notify the frontend that it needs to use
     * revealCommitment2, which takes a signature. This will always return false,
     * unless the frontend should be prompted to provide a signature.
     */
    export interface revealCommitment extends $.OutputField {
      name: "revealCommitment";
      arguments: {
        /**
         * In this highly simplified form, this is the Trading address to provide the
         * commitment for. This information will be kept until the contract goes into a state
         * of being able to be predicted (after the whinge is picked up on).
         */
        tradingAddr: {
          kind: "InputField";
          name: "tradingAddr";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The sender's address. This is needed to simulate and then send the call. If someone
         * were to abuse this permissionless process, the degraded form would be the frontend
         * needing to be prompted for a signature before accepting submissions. The backend
         * will deduplicate this once the time has begun.
         */
        sender: {
          kind: "InputField";
          name: "sender";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The seed that's in use for this commitment. This is a large number, so this is in
         * base10 as a string, which is handled with Go.
         */
        seed: {
          kind: "InputField";
          name: "seed";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The preferred outcome, hex identified, preceded with 0x.
         */
        preferredOutcome: {
          kind: "InputField";
          name: "preferredOutcome";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * The degraded form of revealCommitment, this is a version that needs to be used when
     * there's an overabundance of signatures (more than 10), perhaps indicating some form of
     * griefing. This should begin to be used after the server has indicated receipt of
     * revealCommitment, but it's returned true. It's identical to revealCommitment, except
     * gated with a signature, and will reject the user's submission unless they provide a
     * correct signature. True will always be returned here.
     */
    export interface revealCommitment2 extends $.OutputField {
      name: "revealCommitment2";
      arguments: {
        /**
         * In this highly simplified form, this is the Trading address to provide the
         * commitment for. This information will be kept until the contract goes into a state
         * of being able to be predicted (after the whinge is picked up on).
         */
        tradingAddr: {
          kind: "InputField";
          name: "tradingAddr";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The sender's address. This is needed to simulate and then send the call. If someone
         * were to abuse this permissionless process, the degraded form would be the frontend
         * needing to be prompted for a signature before accepting submissions. The backend
         * will deduplicate this once the time has begun.
         */
        sender: {
          kind: "InputField";
          name: "sender";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The seed that's in use for this commitment. This is a large number, so this is in
         * base10 as a string, which is handled with Go.
         */
        seed: {
          kind: "InputField";
          name: "seed";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The preferred outcome, hex identified, preceded with 0x.
         */
        preferredOutcome: {
          kind: "InputField";
          name: "preferredOutcome";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The X coordinate on the elliptic curve for the signature. Hex encoded, with the 0x
         * prefix.
         */
        rr: {
          kind: "InputField";
          name: "rr";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The signature proof, derived from the private key and hash of this submission
         * concenated left to right. Hex encoded, with the 0x prefix.
         */
        s: {
          kind: "InputField";
          name: "s";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The recovery ID (27) for the private key used for this signature. A Int.
         */
        v: {
          kind: "InputField";
          name: "v";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
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

  //                                              Campaign
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Ongoing prediction market competition.
   */
  export interface Campaign extends $.OutputObject {
    name: "Campaign";
    fields: {
      __typename: Campaign.__typename;
      name: Campaign.name;
      description: Campaign.description;
      picture: Campaign.picture;
      creator: Campaign.creator;
      settlement: Campaign.settlement;
      oracleDescription: Campaign.oracleDescription;
      oracleUrls: Campaign.oracleUrls;
      identifier: Campaign.identifier;
      poolAddress: Campaign.poolAddress;
      outcomes: Campaign.outcomes;
      starting: Campaign.starting;
      ending: Campaign.ending;
      x: Campaign.x;
      telegram: Campaign.telegram;
      web: Campaign.web;
    };
  }

  export namespace Campaign {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Campaign";
      };
    }

    /**
     * Name of the campaign. Also used to look up the campaign based on the slug
     * if needed (hyphenated).
     */
    export interface name extends $.OutputField {
      name: "name";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Description of the campaign in simple text.
     */
    export interface description extends $.OutputField {
      name: "description";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Picture of the campaign.
     */
    export interface picture extends $.OutputField {
      name: "picture";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Creator of the campaign.
     */
    export interface creator extends $.OutputField {
      name: "creator";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Wallet;
    }

    /**
     * Defines the method used to determine the winner of a campaign.
     */
    export interface settlement extends $.OutputField {
      name: "settlement";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$SettlementType;
    }

    /**
     * Oracle description defines under which conditions campaigns conclude
     */
    export interface oracleDescription extends $.OutputField {
      name: "oracleDescription";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Oracle URLs are helper sources for documents when the infrastructure market is used as a settlement source.
     */
    export interface oracleUrls extends $.OutputField {
      name: "oracleUrls";
      arguments: {};
      inlineType: [0, [0]];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Identifier that's used to do offline derivation of the campaign pool,
     * and the outcome shares. Is keccak256(concatenated outcome ids)[:8].
     */
    export interface identifier extends $.OutputField {
      name: "identifier";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Pool address to purchase shares, and to receive the cost function.
     */
    export interface poolAddress extends $.OutputField {
      name: "poolAddress";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Outcomes associated with this campaign. If there are only two, it defaults
     * to a "yes", or "no".
     */
    export interface outcomes extends $.OutputField {
      name: "outcomes";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$Outcome;
    }

    /**
     * Expected starting timestamp.
     */
    export interface starting extends $.OutputField {
      name: "starting";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Ending date of the campaign in timestamp
     */
    export interface ending extends $.OutputField {
      name: "ending";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * X/Twitter username
     */
    export interface x extends $.OutputField {
      name: "x";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Telegram username
     */
    export interface telegram extends $.OutputField {
      name: "telegram";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Web url
     */
    export interface web extends $.OutputField {
      name: "web";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                              Outcome
  // --------------------------------------------------------------------------------------------------
  //

  export interface Outcome extends $.OutputObject {
    name: "Outcome";
    fields: {
      __typename: Outcome.__typename;
      name: Outcome.name;
      description: Outcome.description;
      picture: Outcome.picture;
      identifier: Outcome.identifier;
      share: Outcome.share;
    };
  }

  export namespace Outcome {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Outcome";
      };
    }

    /**
     * Name of this campaign.
     */
    export interface name extends $.OutputField {
      name: "name";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Text description of this campaign.
     */
    export interface description extends $.OutputField {
      name: "description";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Picture of the outcome.
     */
    export interface picture extends $.OutputField {
      name: "picture";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Identifier hex encoded associated with this outcome. Used to derive addresses.
     * Is of the form keccak256("o" . name . "d" . description . "s" . seed)[:8]
     */
    export interface identifier extends $.OutputField {
      name: "identifier";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Share address to trade this outcome.
     */
    export interface share extends $.OutputField {
      name: "share";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Share;
    }
  }

  //                                               Wallet
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Wallet of the creator.
   */
  export interface Wallet extends $.OutputObject {
    name: "Wallet";
    fields: {
      __typename: Wallet.__typename;
      address: Wallet.address;
    };
  }

  export namespace Wallet {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Wallet";
      };
    }

    /**
     * Wallet address of this wallet, in hex.
     */
    export interface address extends $.OutputField {
      name: "address";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                               Share
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Share representing the outcome of the current amount.
   */
  export interface Share extends $.OutputObject {
    name: "Share";
    fields: {
      __typename: Share.__typename;
      address: Share.address;
    };
  }

  export namespace Share {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Share";
      };
    }

    /**
     * ERC20 address of this campaign.
     */
    export interface address extends $.OutputField {
      name: "address";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                             Changelog
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * News that could be rendered to a viewer who hasn't viewed the site in a while.
   * This is CHANGELOG.md that's parsed to be of the form:
   * ```
   * ### (date) (description)
   *
   * * Markdown unsorted list
   *
   * 1. Markdown sorted list
   *
   * ... yadda yadda
   * ```
   *
   * This is converted to HTML.
   */
  export interface Changelog extends $.OutputObject {
    name: "Changelog";
    fields: {
      __typename: Changelog.__typename;
      id: Changelog.id;
      title: Changelog.title;
      afterTs: Changelog.afterTs;
      html: Changelog.html;
    };
  }

  export namespace Changelog {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Changelog";
      };
    }

    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    /**
     * The title of the changelog item.
     */
    export interface title extends $.OutputField {
      name: "title";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * The timestamp that this item is relevant for after.
     */
    export interface afterTs extends $.OutputField {
      name: "afterTs";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * HTML rendered from the Markdown CHANGELOG.md file.
     */
    export interface html extends $.OutputField {
      name: "html";
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

  //                                            OutcomeInput
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Outcome associated with a Campaign creation that's notified to the graph.
   */
  export interface OutcomeInput extends $.InputObject {
    name: "OutcomeInput";
    isAllFieldsNullable: false;
    fields: {
      name: OutcomeInput.name;
      description: OutcomeInput.description;
      seed: OutcomeInput.seed;
      picture: OutcomeInput.picture;
    };
  }

  export namespace OutcomeInput {
    /**
     * Name of the campaign outcome. Ie, "Donald Trump" for the election.
     */
    export interface name extends $.InputField {
      name: "name";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Text description of the outcome.
     */
    export interface description extends $.InputField {
      name: "description";
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Randomly chosen seed for the creation of the identifier.
     */
    export interface seed extends $.InputField {
      name: "seed";
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Picture of the outcome.
     */
    export interface picture extends $.InputField {
      name: "picture";
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

  //                                            Modification
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * HTTP-like interface for mutation. Either a delete, a logical update, or a put for the
   * first time.
   *
   * Members
   * "DELETE" - Delete this modification.
   * "PUT" - Create this modification.
   */
  export interface Modification extends $.Enum {
    name: "Modification";
    members: ["DELETE", "PUT"];
    membersUnion: "DELETE" | "PUT";
  }

  //                                           SettlementType
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Defines the method used to determine the winner of a campaign.
   *
   * Members
   * "ORACLE" - Infrastructure market.
   * "POLL" - Opinion Poll.
   * "AI" - A.I Resolver.
   * "CONTRACT" - Contract State.
   */
  export interface SettlementType extends $.Enum {
    name: "SettlementType";
    members: ["ORACLE", "POLL", "AI", "CONTRACT"];
    membersUnion: "ORACLE" | "POLL" | "AI" | "CONTRACT";
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

  //                                                 ID
  // --------------------------------------------------------------------------------------------------
  //

  export type ID = $.StandardTypes.ID;

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
    export type $$Campaign = Campaign;
    export type $$Outcome = Outcome;
    export type $$Wallet = Wallet;
    export type $$Share = Share;
    export type $$Changelog = Changelog;
    export type $$OutcomeInput = OutcomeInput;
    export type $$Modification = Modification;
    export type $$SettlementType = SettlementType;
    export type $$String = String;
    export type $$Int = Int;
    export type $$Boolean = Boolean;
    export type $$ID = ID;
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
    Modification: Schema.Modification;
    SettlementType: Schema.SettlementType;
    Campaign: Schema.Campaign;
    Outcome: Schema.Outcome;
    Wallet: Schema.Wallet;
    Share: Schema.Share;
    Changelog: Schema.Changelog;
  };
  objects: {
    Campaign: Schema.Campaign;
    Outcome: Schema.Outcome;
    Wallet: Schema.Wallet;
    Share: Schema.Share;
    Changelog: Schema.Changelog;
  };
  unions: {};
  interfaces: {};
  scalarNamesUnion: "String" | "Int" | "Boolean" | "ID";
  scalars: {
    String: Schema.String;
    Int: Schema.Int;
    Boolean: Schema.Boolean;
    ID: Schema.ID;
  };
  scalarRegistry: $Scalars;
  extensions: $$Utilities.GlobalRegistry.TypeExtensions;
}

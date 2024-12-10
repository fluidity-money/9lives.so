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
      frontpage: Query.frontpage;
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
     * Frontpage display. Should have a timeline as to when it should (from) and should
     * not be displayed (until).
     */
    export interface frontpage extends $.OutputField {
      name: "frontpage";
      arguments: {
        category: {
          kind: "InputField";
          name: "category";
          inlineType: [0, [1]];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$Frontpage;
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
     * "Explain" a campaign, so an on-chain campaign creation is listed in the frontend. Campaign is then spooled in a would-be frontend aggregation table.
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

  //                                             Frontpage
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Frontpage that should be displayed for a time window.
   */
  export interface Frontpage extends $.OutputObject {
    name: "Frontpage";
    fields: {
      __typename: Frontpage.__typename;
      id: Frontpage.id;
      from: Frontpage.from;
      until: Frontpage.until;
      categories: Frontpage.categories;
      content: Frontpage.content;
    };
  }

  export namespace Frontpage {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Frontpage";
      };
    }

    /**
     * ID that's used to cache this frontend data.
     */
    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ID;
    }

    /**
     * From when this should be displayed (timestamp)!
     */
    export interface from extends $.OutputField {
      name: "from";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Until when this should be displayed (timestamp)!
     */
    export interface until extends $.OutputField {
      name: "until";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Categories that should be displayed on the frontend in the list.
     */
    export interface categories extends $.OutputField {
      name: "categories";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Campaign item which is assigned.
     */
    export interface content extends $.OutputField {
      name: "content";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Campaign;
    }
  }

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
      oracle: Campaign.oracle;
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
     * Oracle that can decide if a winner happened.
     */
    export interface oracle extends $.OutputField {
      name: "oracle";
      arguments: {};
      inlineType: [1];
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

  //                                                 ID
  // --------------------------------------------------------------------------------------------------
  //

  export type ID = $.StandardTypes.ID;

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
    export type $$Frontpage = Frontpage;
    export type $$Campaign = Campaign;
    export type $$Outcome = Outcome;
    export type $$Wallet = Wallet;
    export type $$Share = Share;
    export type $$Changelog = Changelog;
    export type $$OutcomeInput = OutcomeInput;
    export type $$Modification = Modification;
    export type $$String = String;
    export type $$ID = ID;
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
    Modification: Schema.Modification;
    Frontpage: Schema.Frontpage;
    Campaign: Schema.Campaign;
    Outcome: Schema.Outcome;
    Wallet: Schema.Wallet;
    Share: Schema.Share;
    Changelog: Schema.Changelog;
  };
  objects: {
    Frontpage: Schema.Frontpage;
    Campaign: Schema.Campaign;
    Outcome: Schema.Outcome;
    Wallet: Schema.Wallet;
    Share: Schema.Share;
    Changelog: Schema.Changelog;
  };
  unions: {};
  interfaces: {};
  scalarNamesUnion: "String" | "ID" | "Int" | "Boolean";
  scalars: {
    String: Schema.String;
    ID: Schema.ID;
    Int: Schema.Int;
    Boolean: Schema.Boolean;
  };
  scalarRegistry: $Scalars;
  extensions: $$Utilities.GlobalRegistry.TypeExtensions;
}

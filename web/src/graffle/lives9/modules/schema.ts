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
      userActivity: Query.userActivity;
      userParticipatedCampaigns: Query.userParticipatedCampaigns;
      userTotalVolume: Query.userTotalVolume;
      positionsHistory: Query.positionsHistory;
      userClaims: Query.userClaims;
      userProfile: Query.userProfile;
      userLiquidity: Query.userLiquidity;
      referrersForAddress: Query.referrersForAddress;
      leaderboards: Query.leaderboards;
      referrerByCode: Query.referrerByCode;
      featuredCampaign: Query.featuredCampaign;
      userLPs: Query.userLPs;
      countReferees: Query.countReferees;
      userWonCampaignsProfits: Query.userWonCampaignsProfits;
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
        orderBy: {
          kind: "InputField";
          name: "orderBy";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        searchTerm: {
          kind: "InputField";
          name: "searchTerm";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        page: {
          kind: "InputField";
          name: "page";
          inlineType: [0];
          namedType: $$NamedTypes.$$Int;
        };
        pageSize: {
          kind: "InputField";
          name: "pageSize";
          inlineType: [0];
          namedType: $$NamedTypes.$$Int;
        };
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [0];
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

    /**
     * Returns user's buy and sell activities
     */
    export interface userActivity extends $.OutputField {
      name: "userActivity";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        campaignId: {
          kind: "InputField";
          name: "campaignId";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        page: {
          kind: "InputField";
          name: "page";
          inlineType: [0];
          namedType: $$NamedTypes.$$Int;
        };
        pageSize: {
          kind: "InputField";
          name: "pageSize";
          inlineType: [0];
          namedType: $$NamedTypes.$$Int;
        };
      };
      inlineType: [1, [0]];
      namedType: $$NamedTypes.$$Activity;
    }

    /**
     * Returns user's participated positions as pool address of the campaigns
     * and bought and sought outcome ids
     */
    export interface userParticipatedCampaigns extends $.OutputField {
      name: "userParticipatedCampaigns";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1, [0]];
      namedType: $$NamedTypes.$$Position;
    }

    /**
     * Returns total volume of user's all buy and sell actions
     */
    export interface userTotalVolume extends $.OutputField {
      name: "userTotalVolume";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Returns active positions acitvity history
     */
    export interface positionsHistory extends $.OutputField {
      name: "positionsHistory";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        outcomeIds: {
          kind: "InputField";
          name: "outcomeIds";
          inlineType: [1, [1]];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$Activity;
    }

    /**
     * Return user's claim rewards details
     */
    export interface userClaims extends $.OutputField {
      name: "userClaims";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        campaignId: {
          kind: "InputField";
          name: "campaignId";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1, [0]];
      namedType: $$NamedTypes.$$Claim;
    }

    export interface userProfile extends $.OutputField {
      name: "userProfile";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$Profile;
    }

    /**
     * Returns user's staked liquidity to the markets
     */
    export interface userLiquidity extends $.OutputField {
      name: "userLiquidity";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        tradingAddr: {
          kind: "InputField";
          name: "tradingAddr";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Though the user should only ever create a referrer once, we should assume there might be
     * more, so we'll return more here, and let the frontend decide. Returns the codes.
     */
    export interface referrersForAddress extends $.OutputField {
      name: "referrersForAddress";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Leaderboards for this week.
     */
    export interface leaderboards extends $.OutputField {
      name: "leaderboards";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$LeaderboardWeekly;
    }

    /**
     * Get referrer address by its generated code.
     */
    export interface referrerByCode extends $.OutputField {
      name: "referrerByCode";
      arguments: {
        code: {
          kind: "InputField";
          name: "code";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Aggregates recent trading activity and liquidity data per pool.
     * Combines liquidity changes, hourly volume, current liquidity, and buy/sell volume,
     * then ranks pools and returns recent shown buy/sell events with these metrics.
     */
    export interface featuredCampaign extends $.OutputField {
      name: "featuredCampaign";
      arguments: {
        limit: {
          kind: "InputField";
          name: "limit";
          inlineType: [0];
          namedType: $$NamedTypes.$$Int;
        };
      };
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$Campaign;
    }

    /**
     * Return users active liquidity staked to the campaigns
     */
    export interface userLPs extends $.OutputField {
      name: "userLPs";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$LP;
    }

    /**
     * Get the count of the referees
     */
    export interface countReferees extends $.OutputField {
      name: "countReferees";
      arguments: {
        referrerAddress: {
          kind: "InputField";
          name: "referrerAddress";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Returns won campaigns profit according to share's total cost
     */
    export interface userWonCampaignsProfits extends $.OutputField {
      name: "userWonCampaignsProfits";
      arguments: {
        address: {
          kind: "InputField";
          name: "address";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1, [0]];
      namedType: $$NamedTypes.$$CampaignProfit;
    }
  }

  //                                              Mutation
  // --------------------------------------------------------------------------------------------------
  //

  export interface Mutation extends $.OutputObject {
    name: "Mutation";
    fields: {
      __typename: Mutation.__typename;
      requestPaymaster: Mutation.requestPaymaster;
      explainCampaign: Mutation.explainCampaign;
      revealCommitment: Mutation.revealCommitment;
      revealCommitment2: Mutation.revealCommitment2;
      synchProfile: Mutation.synchProfile;
      genReferrer: Mutation.genReferrer;
      associateReferral: Mutation.associateReferral;
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
     * Request that the Paymaster service this request and deduct funds from the user's USDC
     * EOA using a Permit blob.
     */
    export interface requestPaymaster extends $.OutputField {
      name: "requestPaymaster";
      arguments: {
        /**
         * Ticket number of the Paymaster operation (if any). This could be used to delete it
         * from the request pool if needed.
         */
        ticket: {
          kind: "InputField";
          name: "ticket";
          inlineType: [0];
          namedType: $$NamedTypes.$$Int;
        };
        /**
         * Type of modification to the Paymaster operation.
         */
        type: {
          kind: "InputField";
          name: "type";
          inlineType: [1];
          namedType: $$NamedTypes.$$Modification;
        };
        /**
         * Nonce of the operation to bump with.
         */
        nonce: {
          kind: "InputField";
          name: "nonce";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Execution deadline of the Paymaster operation.
         */
        deadline: {
          kind: "InputField";
          name: "deadline";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        /**
         * The amount the user supplied with this Permit signature.
         */
        permitAmount: {
          kind: "InputField";
          name: "permitAmount";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Arguments for this will be reconstructed based on the arguments to the Paymaster.
         */
        permitV: {
          kind: "InputField";
          name: "permitV";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        permitR: {
          kind: "InputField";
          name: "permitR";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        permitS: {
          kind: "InputField";
          name: "permitS";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Type of Paymaster operation to perform.
         */
        operation: {
          kind: "InputField";
          name: "operation";
          inlineType: [1];
          namedType: $$NamedTypes.$$PaymasterOperation;
        };
        /**
         * Owner to do this operation for (the sender's address).
         */
        owner: {
          kind: "InputField";
          name: "owner";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Outcome to use, if any.
         */
        outcome: {
          kind: "InputField";
          name: "outcome";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Referrer of the user (if any).
         */
        referrer: {
          kind: "InputField";
          name: "referrer";
          inlineType: [0];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Market to perform this operation for.
         */
        market: {
          kind: "InputField";
          name: "market";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Quoted fee to denominate from the user's USDC asset. Should be based on a quote
         * from Camelot using a quote.
         */
        maximumFee: {
          kind: "InputField";
          name: "maximumFee";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Amount of the base asset spend for the operation. This could be the amount to sell
         * if selling, or USDC if buying.
         */
        amountToSpend: {
          kind: "InputField";
          name: "amountToSpend";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * Minimum number the replacement asset to receive back, if any. This could be USDC if
         * selling, or USDC if buying.
         */
        minimumBack: {
          kind: "InputField";
          name: "minimumBack";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The originating chain ID for this signature.
         */
        originatingChainId: {
          kind: "InputField";
          name: "originatingChainId";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The outgoing chain EID that's needed for Stargate.
         */
        outgoingChainEid: {
          kind: "InputField";
          name: "outgoingChainEid";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
        rr: {
          kind: "InputField";
          name: "rr";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        s: {
          kind: "InputField";
          name: "s";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        v: {
          kind: "InputField";
          name: "v";
          inlineType: [1];
          namedType: $$NamedTypes.$$Int;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
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
          inlineType: [0];
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
        /**
         * Should this be a fake execution as a dry run?
         */
        isFake: {
          kind: "InputField";
          name: "isFake";
          inlineType: [0];
          namedType: $$NamedTypes.$$Boolean;
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
          inlineType: [1];
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
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The seed that's in use for this commitment. This is a large number, so this is in
         * base10 as a string, which is handled with Go.
         */
        seed: {
          kind: "InputField";
          name: "seed";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The preferred outcome, hex identified, preceded with 0x.
         */
        preferredOutcome: {
          kind: "InputField";
          name: "preferredOutcome";
          inlineType: [1];
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
          inlineType: [1];
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
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The seed that's in use for this commitment. This is a large number, so this is in
         * base10 as a string, which is handled with Go.
         */
        seed: {
          kind: "InputField";
          name: "seed";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The preferred outcome, hex identified, preceded with 0x.
         */
        preferredOutcome: {
          kind: "InputField";
          name: "preferredOutcome";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The X coordinate on the elliptic curve for the signature. Hex encoded, with the 0x
         * prefix.
         */
        rr: {
          kind: "InputField";
          name: "rr";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The signature proof, derived from the private key and hash of this submission
         * concenated left to right. Hex encoded, with the 0x prefix.
         */
        s: {
          kind: "InputField";
          name: "s";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The recovery ID (27) for the private key used for this signature. A Int.
         */
        v: {
          kind: "InputField";
          name: "v";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$Boolean;
    }

    export interface synchProfile extends $.OutputField {
      name: "synchProfile";
      arguments: {
        walletAddress: {
          kind: "InputField";
          name: "walletAddress";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        email: {
          kind: "InputField";
          name: "email";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [0];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Generate a referrer code, using the identifier that the user gave us.
     */
    export interface genReferrer extends $.OutputField {
      name: "genReferrer";
      arguments: {
        /**
         * Wallet address to generate the code for.
         */
        walletAddress: {
          kind: "InputField";
          name: "walletAddress";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The code that the user chose to associate with them.
         */
        code: {
          kind: "InputField";
          name: "code";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
      };
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Sign that the database should recommend to your browser that you're entitled to a
     * referral. Reconstructs this:
     *
     * Referral(address sender,address referrer,uint256 deadline)
     */
    export interface associateReferral extends $.OutputField {
      name: "associateReferral";
      arguments: {
        /**
         * The user's address to verify this for.
         */
        sender: {
          kind: "InputField";
          name: "sender";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The code the referrer generated here.
         */
        code: {
          kind: "InputField";
          name: "code";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The X coordinate on the elliptic curve for the signature. Hex encoded, with the 0x
         * prefix.
         */
        rr: {
          kind: "InputField";
          name: "rr";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The signature proof, derived from the private key and hash of this submission
         * concenated left to right. Hex encoded, with the 0x prefix.
         */
        s: {
          kind: "InputField";
          name: "s";
          inlineType: [1];
          namedType: $$NamedTypes.$$String;
        };
        /**
         * The recovery ID (27) for the private key used for this signature. A Int.
         */
        v: {
          kind: "InputField";
          name: "v";
          inlineType: [1];
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

  //                                                 LP
  // --------------------------------------------------------------------------------------------------
  //

  export interface LP extends $.OutputObject {
    name: "LP";
    fields: {
      __typename: LP.__typename;
      liquidity: LP.liquidity;
      campaign: LP.campaign;
    };
  }

  export namespace LP {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "LP";
      };
    }

    export interface liquidity extends $.OutputField {
      name: "liquidity";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    export interface campaign extends $.OutputField {
      name: "campaign";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$Campaign;
    }
  }

  //                                           CampaignProfit
  // --------------------------------------------------------------------------------------------------
  //

  export interface CampaignProfit extends $.OutputObject {
    name: "CampaignProfit";
    fields: {
      __typename: CampaignProfit.__typename;
      poolAddress: CampaignProfit.poolAddress;
      Profit: CampaignProfit.Profit;
    };
  }

  export namespace CampaignProfit {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "CampaignProfit";
      };
    }

    export interface poolAddress extends $.OutputField {
      name: "poolAddress";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    export interface Profit extends $.OutputField {
      name: "Profit";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$Int;
    }
  }

  //                                              Settings
  // --------------------------------------------------------------------------------------------------
  //

  export interface Settings extends $.OutputObject {
    name: "Settings";
    fields: {
      __typename: Settings.__typename;
      notification: Settings.notification;
      refererr: Settings.refererr;
    };
  }

  export namespace Settings {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Settings";
      };
    }

    /**
     * Multiple settings can be added here
     */
    export interface notification extends $.OutputField {
      name: "notification";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Did the user click a referrer link that we should hint to the browser?
     */
    export interface refererr extends $.OutputField {
      name: "refererr";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                              Profile
  // --------------------------------------------------------------------------------------------------
  //

  export interface Profile extends $.OutputObject {
    name: "Profile";
    fields: {
      __typename: Profile.__typename;
      walletAddress: Profile.walletAddress;
      email: Profile.email;
      settings: Profile.settings;
    };
  }

  export namespace Profile {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Profile";
      };
    }

    export interface walletAddress extends $.OutputField {
      name: "walletAddress";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface email extends $.OutputField {
      name: "email";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface settings extends $.OutputField {
      name: "settings";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$Settings;
    }
  }

  //                                               Claim
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * User reward claims as a winner of a prediction market
   */
  export interface Claim extends $.OutputObject {
    name: "Claim";
    fields: {
      __typename: Claim.__typename;
      sharesSpent: Claim.sharesSpent;
      fusdcReceived: Claim.fusdcReceived;
      winner: Claim.winner;
      content: Claim.content;
      createdAt: Claim.createdAt;
    };
  }

  export namespace Claim {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Claim";
      };
    }

    export interface sharesSpent extends $.OutputField {
      name: "sharesSpent";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface fusdcReceived extends $.OutputField {
      name: "fusdcReceived";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface winner extends $.OutputField {
      name: "winner";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface content extends $.OutputField {
      name: "content";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Campaign;
    }

    export interface createdAt extends $.OutputField {
      name: "createdAt";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }
  }

  //                                              Position
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Participated pool address of the campaign and bought and sought outcome ids
   */
  export interface Position extends $.OutputObject {
    name: "Position";
    fields: {
      __typename: Position.__typename;
      campaignId: Position.campaignId;
      outcomeIds: Position.outcomeIds;
      content: Position.content;
    };
  }

  export namespace Position {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Position";
      };
    }

    export interface campaignId extends $.OutputField {
      name: "campaignId";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface outcomeIds extends $.OutputField {
      name: "outcomeIds";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$String;
    }

    export interface content extends $.OutputField {
      name: "content";
      arguments: {};
      inlineType: [0];
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
      createdAt: Campaign.createdAt;
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
      winner: Campaign.winner;
      totalVolume: Campaign.totalVolume;
      liquidityVested: Campaign.liquidityVested;
      investmentAmounts: Campaign.investmentAmounts;
      banners: Campaign.banners;
      categories: Campaign.categories;
      isDpm: Campaign.isDpm;
      shares: Campaign.shares;
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
      inlineType: [0];
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
     * Timestamp of the creation of the creation of this campaign (specifically, when it was
     * included).
     */
    export interface createdAt extends $.OutputField {
      name: "createdAt";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
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

    /**
     * If any outcome declared as winner, it returns bytes8 id
     */
    export interface winner extends $.OutputField {
      name: "winner";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * It returns total volume (buys+sells+vested) as usd
     */
    export interface totalVolume extends $.OutputField {
      name: "totalVolume";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * It returns current vested amount as usd
     */
    export interface liquidityVested extends $.OutputField {
      name: "liquidityVested";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Represents investment results bytes8 ids to amounts.
     */
    export interface investmentAmounts extends $.OutputField {
      name: "investmentAmounts";
      arguments: {};
      inlineType: [1, [0]];
      namedType: $$NamedTypes.$$InvestmentAmounts;
    }

    /**
     * Any moderator sent banners notifying people of a change in this market.
     */
    export interface banners extends $.OutputField {
      name: "banners";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Campaigns can be tagged with multiple categories
     */
    export interface categories extends $.OutputField {
      name: "categories";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * For dpm markets it is true, for amms false
     */
    export interface isDpm extends $.OutputField {
      name: "isDpm";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$Boolean;
    }

    /**
     * Latest total shares of the campaign to calculate prices of the outcomes
     */
    export interface shares extends $.OutputField {
      name: "shares";
      arguments: {};
      inlineType: [1, [0]];
      namedType: $$NamedTypes.$$CampaignShare;
    }
  }

  //                                           CampaignShare
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Campaign outcome share with identifier to match
   */
  export interface CampaignShare extends $.OutputObject {
    name: "CampaignShare";
    fields: {
      __typename: CampaignShare.__typename;
      shares: CampaignShare.shares;
      identifier: CampaignShare.identifier;
    };
  }

  export namespace CampaignShare {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "CampaignShare";
      };
    }

    export interface shares extends $.OutputField {
      name: "shares";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    export interface identifier extends $.OutputField {
      name: "identifier";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                        LeaderboardPosition
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Leaderboard position that's sent via the UI.
   */
  export interface LeaderboardPosition extends $.OutputObject {
    name: "LeaderboardPosition";
    fields: {
      __typename: LeaderboardPosition.__typename;
      address: LeaderboardPosition.address;
      volume: LeaderboardPosition.volume;
    };
  }

  export namespace LeaderboardPosition {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "LeaderboardPosition";
      };
    }

    /**
     * Address of the position participant.
     */
    export interface address extends $.OutputField {
      name: "address";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Accumulated volume that the user has created, rounded down in USDC.
     */
    export interface volume extends $.OutputField {
      name: "volume";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }
  }

  //                                         LeaderboardWeekly
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Weekly leaderboard display that's sent via the leaderboard endpoint.
   */
  export interface LeaderboardWeekly extends $.OutputObject {
    name: "LeaderboardWeekly";
    fields: {
      __typename: LeaderboardWeekly.__typename;
      referrers: LeaderboardWeekly.referrers;
      volume: LeaderboardWeekly.volume;
      creators: LeaderboardWeekly.creators;
    };
  }

  export namespace LeaderboardWeekly {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "LeaderboardWeekly";
      };
    }

    /**
     * Top referrers. Only the top 25.
     */
    export interface referrers extends $.OutputField {
      name: "referrers";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$LeaderboardPosition;
    }

    /**
     * Top volume. Only the top 25.
     */
    export interface volume extends $.OutputField {
      name: "volume";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$LeaderboardPosition;
    }

    /**
     * Top campaign creators by volume. Only the top 25.
     */
    export interface creators extends $.OutputField {
      name: "creators";
      arguments: {};
      inlineType: [1, [1]];
      namedType: $$NamedTypes.$$LeaderboardPosition;
    }
  }

  //                                         InvestmentAmounts
  // --------------------------------------------------------------------------------------------------
  //

  export interface InvestmentAmounts extends $.OutputObject {
    name: "InvestmentAmounts";
    fields: {
      __typename: InvestmentAmounts.__typename;
      id: InvestmentAmounts.id;
      usdc: InvestmentAmounts.usdc;
      share: InvestmentAmounts.share;
    };
  }

  export namespace InvestmentAmounts {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "InvestmentAmounts";
      };
    }

    /**
     * outcome id bytes8
     */
    export interface id extends $.OutputField {
      name: "id";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * 6 decimals fusdc
     */
    export interface usdc extends $.OutputField {
      name: "usdc";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * 6 decimals share
     */
    export interface share extends $.OutputField {
      name: "share";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
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
     * Picture of the outcome.
     */
    export interface picture extends $.OutputField {
      name: "picture";
      arguments: {};
      inlineType: [0];
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

  //                                              Activity
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Represents a buy or sell activity.
   */
  export interface Activity extends $.OutputObject {
    name: "Activity";
    fields: {
      __typename: Activity.__typename;
      txHash: Activity.txHash;
      recipient: Activity.recipient;
      poolAddress: Activity.poolAddress;
      fromAmount: Activity.fromAmount;
      fromSymbol: Activity.fromSymbol;
      toAmount: Activity.toAmount;
      toSymbol: Activity.toSymbol;
      type: Activity.type;
      outcomeId: Activity.outcomeId;
      outcomeName: Activity.outcomeName;
      outcomePic: Activity.outcomePic;
      campaignName: Activity.campaignName;
      campaignId: Activity.campaignId;
      totalVolume: Activity.totalVolume;
      createdAt: Activity.createdAt;
    };
  }

  export namespace Activity {
    export interface __typename extends $.OutputField {
      name: "__typename";
      arguments: {};
      inlineType: [1];
      namedType: {
        kind: "__typename";
        value: "Activity";
      };
    }

    /**
     * Transaction hash of the activity.
     */
    export interface txHash extends $.OutputField {
      name: "txHash";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Address of the recipient involved in the activity.
     */
    export interface recipient extends $.OutputField {
      name: "recipient";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Pool address associated with the activity.
     */
    export interface poolAddress extends $.OutputField {
      name: "poolAddress";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Amount of the asset being transferred from.
     */
    export interface fromAmount extends $.OutputField {
      name: "fromAmount";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Symbol of the asset being transferred from.
     */
    export interface fromSymbol extends $.OutputField {
      name: "fromSymbol";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Amount of the asset being transferred to.
     */
    export interface toAmount extends $.OutputField {
      name: "toAmount";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Symbol of the asset being transferred to.
     */
    export interface toSymbol extends $.OutputField {
      name: "toSymbol";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Type of the activity (buy, sell).
     */
    export interface type extends $.OutputField {
      name: "type";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$ActivityType;
    }

    /**
     * ID of the outcome associated with the activity.
     */
    export interface outcomeId extends $.OutputField {
      name: "outcomeId";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Name of the outcome associated with the activity.
     */
    export interface outcomeName extends $.OutputField {
      name: "outcomeName";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Picture of the outcome associated with the activity.
     */
    export interface outcomePic extends $.OutputField {
      name: "outcomePic";
      arguments: {};
      inlineType: [0];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Name of the campaign associated with the activity.
     */
    export interface campaignName extends $.OutputField {
      name: "campaignName";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * ID of the campaign associated with the activity.
     */
    export interface campaignId extends $.OutputField {
      name: "campaignId";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$String;
    }

    /**
     * Total volume of the activity.
     */
    export interface totalVolume extends $.OutputField {
      name: "totalVolume";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
    }

    /**
     * Timestamp of when the activity was created.
     */
    export interface createdAt extends $.OutputField {
      name: "createdAt";
      arguments: {};
      inlineType: [1];
      namedType: $$NamedTypes.$$Int;
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
    isAllFieldsNullable: true;
    fields: {
      name: OutcomeInput.name;
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
      inlineType: [0];
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

  //                                         PaymasterOperation
  // --------------------------------------------------------------------------------------------------
  //

  export interface PaymasterOperation extends $.Enum {
    name: "PaymasterOperation";
    members: [
      "MINT",
      "SELL",
      "ADD_LIQUIDITY",
      "REMOVE_LIQUIDITY",
      "WITHDRAW_USDC",
    ];
    membersUnion:
      | "MINT"
      | "SELL"
      | "ADD_LIQUIDITY"
      | "REMOVE_LIQUIDITY"
      | "WITHDRAW_USDC";
  }

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

  //                                            ActivityType
  // --------------------------------------------------------------------------------------------------
  //

  /**
   * Represents the type of an activity.
   */
  export interface ActivityType extends $.Enum {
    name: "ActivityType";
    members: ["buy", "sell"];
    membersUnion: "buy" | "sell";
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
    export type $$LP = LP;
    export type $$CampaignProfit = CampaignProfit;
    export type $$Settings = Settings;
    export type $$Profile = Profile;
    export type $$Claim = Claim;
    export type $$Position = Position;
    export type $$Campaign = Campaign;
    export type $$CampaignShare = CampaignShare;
    export type $$LeaderboardPosition = LeaderboardPosition;
    export type $$LeaderboardWeekly = LeaderboardWeekly;
    export type $$InvestmentAmounts = InvestmentAmounts;
    export type $$Outcome = Outcome;
    export type $$Wallet = Wallet;
    export type $$Share = Share;
    export type $$Changelog = Changelog;
    export type $$Activity = Activity;
    export type $$OutcomeInput = OutcomeInput;
    export type $$PaymasterOperation = PaymasterOperation;
    export type $$Modification = Modification;
    export type $$SettlementType = SettlementType;
    export type $$ActivityType = ActivityType;
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
    PaymasterOperation: Schema.PaymasterOperation;
    Modification: Schema.Modification;
    SettlementType: Schema.SettlementType;
    ActivityType: Schema.ActivityType;
    LP: Schema.LP;
    CampaignProfit: Schema.CampaignProfit;
    Settings: Schema.Settings;
    Profile: Schema.Profile;
    Claim: Schema.Claim;
    Position: Schema.Position;
    Campaign: Schema.Campaign;
    CampaignShare: Schema.CampaignShare;
    LeaderboardPosition: Schema.LeaderboardPosition;
    LeaderboardWeekly: Schema.LeaderboardWeekly;
    InvestmentAmounts: Schema.InvestmentAmounts;
    Outcome: Schema.Outcome;
    Wallet: Schema.Wallet;
    Share: Schema.Share;
    Changelog: Schema.Changelog;
    Activity: Schema.Activity;
  };
  objects: {
    LP: Schema.LP;
    CampaignProfit: Schema.CampaignProfit;
    Settings: Schema.Settings;
    Profile: Schema.Profile;
    Claim: Schema.Claim;
    Position: Schema.Position;
    Campaign: Schema.Campaign;
    CampaignShare: Schema.CampaignShare;
    LeaderboardPosition: Schema.LeaderboardPosition;
    LeaderboardWeekly: Schema.LeaderboardWeekly;
    InvestmentAmounts: Schema.InvestmentAmounts;
    Outcome: Schema.Outcome;
    Wallet: Schema.Wallet;
    Share: Schema.Share;
    Changelog: Schema.Changelog;
    Activity: Schema.Activity;
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

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

const Odds = "Odds";

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

const PaymasterOperation: $$Utilities.SchemaDrivenDataMap.Enum = {
  k: "enum",
  n: "PaymasterOperation",
};

const Modification: $$Utilities.SchemaDrivenDataMap.Enum = {
  k: "enum",
  n: "Modification",
};

const SettlementType: $$Utilities.SchemaDrivenDataMap.Enum = {
  k: "enum",
  n: "SettlementType",
};

const ActivityType: $$Utilities.SchemaDrivenDataMap.Enum = {
  k: "enum",
  n: "ActivityType",
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

const PriceMetadataInput: $$Utilities.SchemaDrivenDataMap.InputObject = {
  n: "PriceMetadataInput",
  f: {
    baseAsset: {},
    quoteAsset: {},
    priceTargetForUp: {},
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

const AssetMetadata: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    name: {},
    price: {},
    priceCreatedAt: {},
    hourAgoPrice: {},
    hourAgoPriceCreatedAt: {},
  },
};

const Pnl: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    totalPnl: {},
    volume: {},
  },
};

const Asset: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    totalSpent: {},
    name: {},
  },
};

const UnclaimedCampaign: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    totalSpent: {},
    campaign: {
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const PriceEvent: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    createdAt: {},
    shares: {
      // nt: CampaignShare, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const CommentInvestment: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    amount: {},
  },
};

const Comment: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    id: {},
    campaignId: {},
    createdAt: {},
    walletAddress: {},
    content: {},
    investments: {
      // nt: CommentInvestment, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const LP: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    liquidity: {},
    campaign: {
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const Settings: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    notification: {},
    refererr: {},
  },
};

const Profile: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    walletAddress: {},
    email: {},
    settings: {
      // nt: Settings, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const Claim: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    sharesSpent: {},
    fusdcReceived: {},
    winner: {},
    content: {
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
    createdAt: {},
    txHash: {},
    pnl: {},
  },
};

const Position: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    campaignId: {},
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
    liquidityVested: {},
    investmentAmounts: {
      // nt: InvestmentAmounts, <-- Assigned later to avoid potential circular dependency.
    },
    banners: {},
    categories: {},
    isDpm: {},
    isDppm: {},
    shares: {
      // nt: CampaignShare, <-- Assigned later to avoid potential circular dependency.
    },
    priceMetadata: {
      // nt: PriceMetadata, <-- Assigned later to avoid potential circular dependency.
    },
    odds: {
      nt: Odds,
    },
  },
};

const CampaignShare: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    shares: {},
    identifier: {},
  },
};

const LeaderboardPosition: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    address: {},
    volume: {},
  },
};

const LeaderboardWeekly: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    referrers: {
      // nt: LeaderboardPosition, <-- Assigned later to avoid potential circular dependency.
    },
    volume: {
      // nt: LeaderboardPosition, <-- Assigned later to avoid potential circular dependency.
    },
    creators: {
      // nt: LeaderboardPosition, <-- Assigned later to avoid potential circular dependency.
    },
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

const Activity: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    txHash: {},
    recipient: {},
    poolAddress: {},
    fromAmount: {},
    fromSymbol: {},
    toAmount: {},
    toSymbol: {},
    type: {},
    outcomeId: {},
    outcomeName: {},
    outcomePic: {},
    campaignName: {},
    campaignId: {},
    totalVolume: {},
    createdAt: {},
    campaignContent: {
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const PriceMetadata: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    baseAsset: {},
    quoteAsset: {},
    priceTargetForUp: {},
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
        address: {
          nt: String,
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
    userActivity: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
        campaignId: {
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
      // nt: Activity, <-- Assigned later to avoid potential circular dependency.
    },
    userParticipatedCampaigns: {
      a: {
        address: {
          nt: String,
          it: [1],
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
      // nt: Position, <-- Assigned later to avoid potential circular dependency.
    },
    userTotalVolume: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
      },
    },
    positionsHistory: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
        outcomeIds: {
          nt: String,
          it: [1, [1]],
        },
      },
      // nt: Activity, <-- Assigned later to avoid potential circular dependency.
    },
    userClaims: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
        campaignId: {
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
      // nt: Claim, <-- Assigned later to avoid potential circular dependency.
    },
    userProfile: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
      },
      // nt: Profile, <-- Assigned later to avoid potential circular dependency.
    },
    userLiquidity: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
        tradingAddr: {
          nt: String,
          it: [0],
        },
      },
    },
    referrersForAddress: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
      },
    },
    leaderboards: {
      // nt: LeaderboardWeekly, <-- Assigned later to avoid potential circular dependency.
    },
    referrerByCode: {
      a: {
        code: {
          nt: String,
          it: [1],
        },
      },
    },
    featuredCampaign: {
      a: {
        limit: {
          nt: Int,
          it: [0],
        },
      },
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
    userLPs: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
      },
      // nt: LP, <-- Assigned later to avoid potential circular dependency.
    },
    countReferees: {
      a: {
        referrerAddress: {
          nt: String,
          it: [1],
        },
      },
    },
    campaignComments: {
      a: {
        campaignId: {
          nt: String,
          it: [1],
        },
        onlyHolders: {
          nt: Boolean,
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
      // nt: Comment, <-- Assigned later to avoid potential circular dependency.
    },
    campaignPriceEvents: {
      a: {
        poolAddress: {
          nt: String,
          it: [1],
        },
      },
      // nt: PriceEvent, <-- Assigned later to avoid potential circular dependency.
    },
    campaignWeeklyVolume: {
      a: {
        poolAddress: {
          nt: String,
          it: [1],
        },
      },
    },
    campaignBySymbol: {
      a: {
        symbol: {
          nt: String,
          it: [1],
        },
        category: {
          nt: String,
          it: [1],
        },
      },
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
    timebasedCampaigns: {
      a: {
        categories: {
          nt: String,
          it: [1, [1]],
        },
        tokens: {
          nt: String,
          it: [1, [1]],
        },
      },
      // nt: Campaign, <-- Assigned later to avoid potential circular dependency.
    },
    unclaimedCampaigns: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
        token: {
          nt: String,
          it: [0],
        },
      },
      // nt: UnclaimedCampaign, <-- Assigned later to avoid potential circular dependency.
    },
    assets: {
      // nt: Asset, <-- Assigned later to avoid potential circular dependency.
    },
    totalPnL: {
      a: {
        address: {
          nt: String,
          it: [1],
        },
        fromTs: {
          nt: Int,
          it: [0],
        },
        untilTs: {
          nt: Int,
          it: [0],
        },
      },
      // nt: Pnl, <-- Assigned later to avoid potential circular dependency.
    },
    getFinalPrice: {
      a: {
        symbol: {
          nt: String,
          it: [1],
        },
        ending: {
          nt: Int,
          it: [1],
        },
      },
    },
    assetsDeltaHour: {
      // nt: AssetMetadata, <-- Assigned later to avoid potential circular dependency.
    },
  },
};

const Mutation: $$Utilities.SchemaDrivenDataMap.OutputObject = {
  f: {
    postComment: {
      a: {
        campaignId: {
          nt: String,
          it: [1],
        },
        walletAddress: {
          nt: String,
          it: [1],
        },
        content: {
          nt: String,
          it: [1],
        },
        rr: {
          nt: String,
          it: [1],
        },
        s: {
          nt: String,
          it: [1],
        },
        v: {
          nt: Int,
          it: [1],
        },
      },
    },
    deleteComment: {
      a: {
        campaignId: {
          nt: String,
          it: [1],
        },
        id: {
          nt: Int,
          it: [1],
        },
        walletAddress: {
          nt: String,
          it: [1],
        },
        content: {
          nt: String,
          it: [1],
        },
        rr: {
          nt: String,
          it: [1],
        },
        s: {
          nt: String,
          it: [1],
        },
        v: {
          nt: Int,
          it: [1],
        },
      },
    },
    requestPaymaster: {
      a: {
        ticket: {
          nt: Int,
          it: [0],
        },
        type: {
          nt: Modification,
          it: [1],
        },
        nonce: {
          nt: String,
          it: [1],
        },
        deadline: {
          nt: Int,
          it: [1],
        },
        permitAmount: {
          nt: String,
          it: [1],
        },
        permitV: {
          nt: Int,
          it: [1],
        },
        permitR: {
          nt: String,
          it: [1],
        },
        permitS: {
          nt: String,
          it: [1],
        },
        operation: {
          nt: PaymasterOperation,
          it: [1],
        },
        owner: {
          nt: String,
          it: [1],
        },
        outcome: {
          nt: String,
          it: [0],
        },
        referrer: {
          nt: String,
          it: [0],
        },
        market: {
          nt: String,
          it: [1],
        },
        maximumFee: {
          nt: String,
          it: [1],
        },
        amountToSpend: {
          nt: String,
          it: [1],
        },
        minimumBack: {
          nt: String,
          it: [1],
        },
        originatingChainId: {
          nt: String,
          it: [1],
        },
        outgoingChainEid: {
          nt: Int,
          it: [1],
        },
        rr: {
          nt: String,
          it: [1],
        },
        s: {
          nt: String,
          it: [1],
        },
        v: {
          nt: Int,
          it: [1],
        },
      },
    },
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
        isDppm: {
          nt: Boolean,
          it: [1],
        },
        categories: {
          nt: String,
          it: [0, [1]],
        },
        priceMetadata: {
          nt: PriceMetadataInput,
          it: [0],
        },
      },
    },
    revealCommitment: {
      a: {
        tradingAddr: {
          nt: String,
          it: [1],
        },
        sender: {
          nt: String,
          it: [1],
        },
        seed: {
          nt: String,
          it: [1],
        },
        preferredOutcome: {
          nt: String,
          it: [1],
        },
      },
    },
    revealCommitment2: {
      a: {
        tradingAddr: {
          nt: String,
          it: [1],
        },
        sender: {
          nt: String,
          it: [1],
        },
        seed: {
          nt: String,
          it: [1],
        },
        preferredOutcome: {
          nt: String,
          it: [1],
        },
        rr: {
          nt: String,
          it: [1],
        },
        s: {
          nt: String,
          it: [1],
        },
        v: {
          nt: String,
          it: [1],
        },
      },
    },
    synchProfile: {
      a: {
        walletAddress: {
          nt: String,
          it: [1],
        },
        email: {
          nt: String,
          it: [1],
        },
      },
    },
    genReferrer: {
      a: {
        walletAddress: {
          nt: String,
          it: [1],
        },
        code: {
          nt: String,
          it: [1],
        },
      },
    },
    associateReferral: {
      a: {
        sender: {
          nt: String,
          it: [1],
        },
        code: {
          nt: String,
          it: [1],
        },
        rr: {
          nt: String,
          it: [1],
        },
        s: {
          nt: String,
          it: [1],
        },
        v: {
          nt: Int,
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

UnclaimedCampaign.f[`campaign`]!.nt = Campaign;
PriceEvent.f[`shares`]!.nt = CampaignShare;
Comment.f[`investments`]!.nt = CommentInvestment;
LP.f[`campaign`]!.nt = Campaign;
Profile.f[`settings`]!.nt = Settings;
Claim.f[`content`]!.nt = Campaign;
Position.f[`content`]!.nt = Campaign;
Campaign.f[`creator`]!.nt = Wallet;
Campaign.f[`outcomes`]!.nt = Outcome;
Campaign.f[`investmentAmounts`]!.nt = InvestmentAmounts;
Campaign.f[`shares`]!.nt = CampaignShare;
Campaign.f[`priceMetadata`]!.nt = PriceMetadata;
LeaderboardWeekly.f[`referrers`]!.nt = LeaderboardPosition;
LeaderboardWeekly.f[`volume`]!.nt = LeaderboardPosition;
LeaderboardWeekly.f[`creators`]!.nt = LeaderboardPosition;
Outcome.f[`share`]!.nt = Share;
Activity.f[`campaignContent`]!.nt = Campaign;
Query.f[`campaigns`]!.nt = Campaign;
Query.f[`campaignById`]!.nt = Campaign;
Query.f[`changelog`]!.nt = Changelog;
Query.f[`userActivity`]!.nt = Activity;
Query.f[`userParticipatedCampaigns`]!.nt = Position;
Query.f[`positionsHistory`]!.nt = Activity;
Query.f[`userClaims`]!.nt = Claim;
Query.f[`userProfile`]!.nt = Profile;
Query.f[`leaderboards`]!.nt = LeaderboardWeekly;
Query.f[`featuredCampaign`]!.nt = Campaign;
Query.f[`userLPs`]!.nt = LP;
Query.f[`campaignComments`]!.nt = Comment;
Query.f[`campaignPriceEvents`]!.nt = PriceEvent;
Query.f[`campaignBySymbol`]!.nt = Campaign;
Query.f[`timebasedCampaigns`]!.nt = Campaign;
Query.f[`unclaimedCampaigns`]!.nt = UnclaimedCampaign;
Query.f[`assets`]!.nt = Asset;
Query.f[`totalPnL`]!.nt = Pnl;
Query.f[`assetsDeltaHour`]!.nt = AssetMetadata;

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
    Odds,
    PaymasterOperation,
    Modification,
    SettlementType,
    ActivityType,
    OutcomeInput,
    PriceMetadataInput,
    AssetMetadata,
    Pnl,
    Asset,
    UnclaimedCampaign,
    PriceEvent,
    CommentInvestment,
    Comment,
    LP,
    Settings,
    Profile,
    Claim,
    Position,
    Campaign,
    CampaignShare,
    LeaderboardPosition,
    LeaderboardWeekly,
    InvestmentAmounts,
    Outcome,
    Wallet,
    Share,
    Changelog,
    Activity,
    PriceMetadata,
    Query,
    Mutation,
  },
};

export { $schemaDrivenDataMap as schemaDrivenDataMap };

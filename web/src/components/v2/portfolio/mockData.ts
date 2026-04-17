// Mock data for portfolio dev/demo mode
// Simulates different portfolio states for UI verification

export interface MockPosition {
  campaignName: string;
  campaignPicture: string;
  campaignId: string;
  poolAddress: string;
  isDppm: boolean;
  isEnded: boolean;
  winner: string | null;
  outcomes: {
    id: string;
    name: string;
    balance: string;
    balanceRaw: bigint;
    currentPrice: number;
    avgCost: number;
    pnl: number;
    pnlPct: number;
    isWinner: boolean;
    toWin: number;
    history: {
      type: "buy" | "sell";
      price: number;
      qty: number;
      cost: number;
      txHash: string;
      timestamp: number;
    }[];
  }[];
}

export interface MockActivity {
  campaignName: string;
  campaignId: string;
  outcomeName: string;
  outcomePicture: string;
  type: "buy" | "sell";
  price: number;
  qty: number;
  cost: number;
  txHash: string;
  timestamp: number;
}

export interface MockClaim {
  campaignName: string;
  campaignId: string;
  winnerOutcome: string;
  rewardAmount: number;
  sharesSpent: number;
  pnl: number;
  txHash: string;
  timestamp: number;
}

export interface MockLP {
  campaignName: string;
  campaignId: string;
  liquidity: number;
  isEnded: boolean;
  unclaimedRewards: number;
}

export interface MockPortfolioState {
  tierIdx: number;
  netWorth: number;
  pnl: number;
  volume: number;
  available: number;
  positionsValue: number;
  points: number;
  rank: number;
  positions: MockPosition[];
  activities: MockActivity[];
  claims: MockClaim[];
  lps: MockLP[];
}

const now = Date.now();
const hour = 3600000;
const day = 86400000;

export const MOCK_STATES: MockPortfolioState[] = [
  // State 0: Empty portfolio (Stray Cat)
  {
    tierIdx: 0,
    netWorth: 0,
    pnl: 0,
    volume: 0,
    available: 0,
    positionsValue: 0,
    points: 0,
    rank: 0,
    positions: [],
    activities: [],
    claims: [],
    lps: [],
  },

  // State 1: Beginner with 1 position (House Cat)
  {
    tierIdx: 1,
    netWorth: 152.50,
    pnl: 2.50,
    volume: 150.00,
    available: 52.50,
    positionsValue: 100.00,
    points: 124,
    rank: 480,
    positions: [
      {
        campaignName: "BTC above $75,000 by 6:30 PM",
        campaignPicture: "",
        campaignId: "0x1234",
        poolAddress: "0xpool1",
        isDppm: true,
        isEnded: false,
        winner: null,
        outcomes: [
          {
            id: "0xout1",
            name: "Up",
            balance: "150.00",
            balanceRaw: BigInt(150e6),
            currentPrice: 0.67,
            avgCost: 0.50,
            pnl: 25.50,
            pnlPct: 34.0,
            isWinner: false,
            toWin: 150.00,
            history: [
              { type: "buy", price: 0.50, qty: 150, cost: 75.00, txHash: "0xabc123", timestamp: now - 2 * hour },
              { type: "buy", price: 0.52, qty: 50, cost: 26.00, txHash: "0xdef456", timestamp: now - hour },
            ],
          },
        ],
      },
    ],
    activities: [
      {
        campaignName: "BTC above $75,000 by 6:30 PM",
        campaignId: "0x1234",
        outcomeName: "Up",
        outcomePicture: "",
        type: "buy",
        price: 0.50,
        qty: 150,
        cost: 75.00,
        txHash: "0xabc123",
        timestamp: now - 2 * hour,
      },
      {
        campaignName: "BTC above $75,000 by 6:30 PM",
        campaignId: "0x1234",
        outcomeName: "Up",
        outcomePicture: "",
        type: "buy",
        price: 0.52,
        qty: 50,
        cost: 26.00,
        txHash: "0xdef456",
        timestamp: now - hour,
      },
    ],
    claims: [],
    lps: [],
  },

  // State 2: Active trader with multiple positions (Oracle Cat)
  {
    tierIdx: 2,
    netWorth: 1245.80,
    pnl: 245.80,
    volume: 3200.00,
    available: 345.80,
    positionsValue: 900.00,
    points: 374,
    rank: 128,
    positions: [
      {
        campaignName: "BTC above $75,000 by 6:30 PM",
        campaignPicture: "",
        campaignId: "0x1234",
        poolAddress: "0xpool1",
        isDppm: true,
        isEnded: false,
        winner: null,
        outcomes: [
          {
            id: "0xout1",
            name: "Up",
            balance: "450.00",
            balanceRaw: BigInt(450e6),
            currentPrice: 0.72,
            avgCost: 0.55,
            pnl: 76.50,
            pnlPct: 30.9,
            isWinner: false,
            toWin: 450.00,
            history: [
              { type: "buy", price: 0.55, qty: 300, cost: 165.00, txHash: "0xabc1", timestamp: now - 3 * hour },
              { type: "buy", price: 0.54, qty: 150, cost: 81.00, txHash: "0xabc2", timestamp: now - 2 * hour },
            ],
          },
        ],
      },
      {
        campaignName: "Gold (PAXG) above $4,800 by 7:00 PM",
        campaignPicture: "",
        campaignId: "0x5678",
        poolAddress: "0xpool2",
        isDppm: true,
        isEnded: false,
        winner: null,
        outcomes: [
          {
            id: "0xout3",
            name: "Down",
            balance: "200.00",
            balanceRaw: BigInt(200e6),
            currentPrice: 0.35,
            avgCost: 0.42,
            pnl: -14.00,
            pnlPct: -16.7,
            isWinner: false,
            toWin: 200.00,
            history: [
              { type: "buy", price: 0.42, qty: 200, cost: 84.00, txHash: "0xdef1", timestamp: now - 5 * hour },
            ],
          },
        ],
      },
      {
        campaignName: "Oil (XYZCL) above $88.00 by 5:45 PM",
        campaignPicture: "",
        campaignId: "0x9abc",
        poolAddress: "0xpool3",
        isDppm: true,
        isEnded: true,
        winner: "0xoutW",
        outcomes: [
          {
            id: "0xoutW",
            name: "Up",
            balance: "300.00",
            balanceRaw: BigInt(300e6),
            currentPrice: 1.00,
            avgCost: 0.60,
            pnl: 120.00,
            pnlPct: 66.7,
            isWinner: true,
            toWin: 300.00,
            history: [
              { type: "buy", price: 0.60, qty: 300, cost: 180.00, txHash: "0xghi1", timestamp: now - day },
            ],
          },
        ],
      },
    ],
    activities: [
      { campaignName: "BTC above $75,000", campaignId: "0x1234", outcomeName: "Up", outcomePicture: "", type: "buy", price: 0.55, qty: 300, cost: 165.00, txHash: "0xabc1", timestamp: now - 3 * hour },
      { campaignName: "BTC above $75,000", campaignId: "0x1234", outcomeName: "Up", outcomePicture: "", type: "buy", price: 0.54, qty: 150, cost: 81.00, txHash: "0xabc2", timestamp: now - 2 * hour },
      { campaignName: "Gold above $4,800", campaignId: "0x5678", outcomeName: "Down", outcomePicture: "", type: "buy", price: 0.42, qty: 200, cost: 84.00, txHash: "0xdef1", timestamp: now - 5 * hour },
      { campaignName: "Oil above $88.00", campaignId: "0x9abc", outcomeName: "Up", outcomePicture: "", type: "buy", price: 0.60, qty: 300, cost: 180.00, txHash: "0xghi1", timestamp: now - day },
      { campaignName: "BTC above $74,500", campaignId: "0x2222", outcomeName: "Down", outcomePicture: "", type: "sell", price: 0.48, qty: 100, cost: 48.00, txHash: "0xjkl1", timestamp: now - 6 * hour },
    ],
    claims: [
      { campaignName: "ETH above $3,200 by 4 PM", campaignId: "0xaaaa", winnerOutcome: "Up", rewardAmount: 89.50, sharesSpent: 65.00, pnl: 24.50, txHash: "0xclaim1", timestamp: now - 2 * day },
    ],
    lps: [
      { campaignName: "Will Bitcoin hit $80k this week?", campaignId: "0xlp1", liquidity: 500.00, isEnded: false, unclaimedRewards: 12.50 },
    ],
  },

  // State 3: Whale with many positions (Mystic Cat)
  {
    tierIdx: 3,
    netWorth: 8450.00,
    pnl: 1450.00,
    volume: 25000.00,
    available: 2450.00,
    positionsValue: 6000.00,
    points: 624,
    rank: 42,
    positions: [
      {
        campaignName: "BTC above $76,000 by 7:00 PM",
        campaignPicture: "",
        campaignId: "0xp1",
        poolAddress: "0xpool10",
        isDppm: true,
        isEnded: false,
        winner: null,
        outcomes: [
          { id: "0xo1", name: "Up", balance: "2000.00", balanceRaw: BigInt(2000e6), currentPrice: 0.82, avgCost: 0.65, pnl: 340.00, pnlPct: 26.2, isWinner: false, toWin: 2000.00, history: [
            { type: "buy", price: 0.65, qty: 2000, cost: 1300.00, txHash: "0xt1", timestamp: now - 4 * hour },
          ]},
        ],
      },
      {
        campaignName: "Gold above $4,850 by 8:00 PM",
        campaignPicture: "",
        campaignId: "0xp2",
        poolAddress: "0xpool11",
        isDppm: true,
        isEnded: false,
        winner: null,
        outcomes: [
          { id: "0xo2", name: "Down", balance: "1500.00", balanceRaw: BigInt(1500e6), currentPrice: 0.55, avgCost: 0.48, pnl: 105.00, pnlPct: 14.6, isWinner: false, toWin: 1500.00, history: [
            { type: "buy", price: 0.48, qty: 1500, cost: 720.00, txHash: "0xt2", timestamp: now - 6 * hour },
          ]},
        ],
      },
      {
        campaignName: "Oil above $90.00 by 6:00 PM",
        campaignPicture: "",
        campaignId: "0xp3",
        poolAddress: "0xpool12",
        isDppm: true,
        isEnded: true,
        winner: "0xo3",
        outcomes: [
          { id: "0xo3", name: "Up", balance: "1200.00", balanceRaw: BigInt(1200e6), currentPrice: 1.00, avgCost: 0.45, pnl: 660.00, pnlPct: 122.2, isWinner: true, toWin: 1200.00, history: [
            { type: "buy", price: 0.45, qty: 1200, cost: 540.00, txHash: "0xt3", timestamp: now - 2 * day },
          ]},
        ],
      },
      {
        campaignName: "BTC above $74,000 by 5:30 PM",
        campaignPicture: "",
        campaignId: "0xp4",
        poolAddress: "0xpool13",
        isDppm: true,
        isEnded: true,
        winner: "0xo5",
        outcomes: [
          { id: "0xo4", name: "Up", balance: "800.00", balanceRaw: BigInt(800e6), currentPrice: 0.00, avgCost: 0.62, pnl: -496.00, pnlPct: -100.0, isWinner: false, toWin: 0, history: [
            { type: "buy", price: 0.62, qty: 800, cost: 496.00, txHash: "0xt4", timestamp: now - 3 * day },
          ]},
        ],
      },
    ],
    activities: [
      { campaignName: "BTC above $76,000", campaignId: "0xp1", outcomeName: "Up", outcomePicture: "", type: "buy", price: 0.65, qty: 2000, cost: 1300.00, txHash: "0xt1", timestamp: now - 4 * hour },
      { campaignName: "Gold above $4,850", campaignId: "0xp2", outcomeName: "Down", outcomePicture: "", type: "buy", price: 0.48, qty: 1500, cost: 720.00, txHash: "0xt2", timestamp: now - 6 * hour },
      { campaignName: "Oil above $90.00", campaignId: "0xp3", outcomeName: "Up", outcomePicture: "", type: "buy", price: 0.45, qty: 1200, cost: 540.00, txHash: "0xt3", timestamp: now - 2 * day },
      { campaignName: "BTC above $74,000", campaignId: "0xp4", outcomeName: "Up", outcomePicture: "", type: "buy", price: 0.62, qty: 800, cost: 496.00, txHash: "0xt4", timestamp: now - 3 * day },
      { campaignName: "BTC above $75,500", campaignId: "0xp5", outcomeName: "Up", outcomePicture: "", type: "sell", price: 0.78, qty: 500, cost: 390.00, txHash: "0xt5", timestamp: now - 8 * hour },
      { campaignName: "Gold above $4,750", campaignId: "0xp6", outcomeName: "Down", outcomePicture: "", type: "buy", price: 0.35, qty: 1000, cost: 350.00, txHash: "0xt6", timestamp: now - day },
    ],
    claims: [
      { campaignName: "BTC above $73,000 by 3 PM", campaignId: "0xc1", winnerOutcome: "Up", rewardAmount: 450.00, sharesSpent: 280.00, pnl: 170.00, txHash: "0xcl1", timestamp: now - 3 * day },
      { campaignName: "Gold above $4,700 by 2 PM", campaignId: "0xc2", winnerOutcome: "Up", rewardAmount: 320.00, sharesSpent: 200.00, pnl: 120.00, txHash: "0xcl2", timestamp: now - 5 * day },
      { campaignName: "Oil above $87.50 by 4 PM", campaignId: "0xc3", winnerOutcome: "Down", rewardAmount: 85.00, sharesSpent: 150.00, pnl: -65.00, txHash: "0xcl3", timestamp: now - 7 * day },
    ],
    lps: [
      { campaignName: "Will Bitcoin hit $80k this week?", campaignId: "0xlp1", liquidity: 2000.00, isEnded: false, unclaimedRewards: 45.00 },
      { campaignName: "ETH merge impact prediction", campaignId: "0xlp2", liquidity: 1500.00, isEnded: true, unclaimedRewards: 120.00 },
    ],
  },

  // State 4: Legendary trader (Cosmic Cat)
  {
    tierIdx: 4,
    netWorth: 52340.00,
    pnl: 12340.00,
    volume: 180000.00,
    available: 12340.00,
    positionsValue: 40000.00,
    points: 1250,
    rank: 7,
    positions: [
      {
        campaignName: "BTC above $78,000 by EOD",
        campaignPicture: "",
        campaignId: "0xleg1",
        poolAddress: "0xlegpool1",
        isDppm: true,
        isEnded: false,
        winner: null,
        outcomes: [
          { id: "0xlo1", name: "Up", balance: "15000.00", balanceRaw: BigInt(15000e6), currentPrice: 0.88, avgCost: 0.62, pnl: 3900.00, pnlPct: 41.9, isWinner: false, toWin: 15000.00, history: [
            { type: "buy", price: 0.60, qty: 10000, cost: 6000.00, txHash: "0xlh1", timestamp: now - 5 * hour },
            { type: "buy", price: 0.65, qty: 5000, cost: 3250.00, txHash: "0xlh2", timestamp: now - 3 * hour },
          ]},
        ],
      },
      {
        campaignName: "Gold above $5,000 by Friday",
        campaignPicture: "",
        campaignId: "0xleg2",
        poolAddress: "0xlegpool2",
        isDppm: false,
        isEnded: false,
        winner: null,
        outcomes: [
          { id: "0xlo2", name: "Up", balance: "8000.00", balanceRaw: BigInt(8000e6), currentPrice: 0.45, avgCost: 0.38, pnl: 560.00, pnlPct: 18.4, isWinner: false, toWin: 8000.00, history: [
            { type: "buy", price: 0.38, qty: 8000, cost: 3040.00, txHash: "0xlh3", timestamp: now - day },
          ]},
          { id: "0xlo3", name: "Down", balance: "5000.00", balanceRaw: BigInt(5000e6), currentPrice: 0.55, avgCost: 0.50, pnl: 250.00, pnlPct: 10.0, isWinner: false, toWin: 5000.00, history: [
            { type: "buy", price: 0.50, qty: 5000, cost: 2500.00, txHash: "0xlh4", timestamp: now - day },
          ]},
        ],
      },
    ],
    activities: [
      { campaignName: "BTC above $78,000", campaignId: "0xleg1", outcomeName: "Up", outcomePicture: "", type: "buy", price: 0.60, qty: 10000, cost: 6000.00, txHash: "0xlh1", timestamp: now - 5 * hour },
      { campaignName: "BTC above $78,000", campaignId: "0xleg1", outcomeName: "Up", outcomePicture: "", type: "buy", price: 0.65, qty: 5000, cost: 3250.00, txHash: "0xlh2", timestamp: now - 3 * hour },
      { campaignName: "Gold above $5,000", campaignId: "0xleg2", outcomeName: "Up", outcomePicture: "", type: "buy", price: 0.38, qty: 8000, cost: 3040.00, txHash: "0xlh3", timestamp: now - day },
      { campaignName: "Gold above $5,000", campaignId: "0xleg2", outcomeName: "Down", outcomePicture: "", type: "buy", price: 0.50, qty: 5000, cost: 2500.00, txHash: "0xlh4", timestamp: now - day },
      { campaignName: "BTC above $77,000", campaignId: "0xleg3", outcomeName: "Up", outcomePicture: "", type: "sell", price: 0.92, qty: 3000, cost: 2760.00, txHash: "0xlh5", timestamp: now - 2 * hour },
    ],
    claims: [
      { campaignName: "BTC above $72,000 by Monday", campaignId: "0xlc1", winnerOutcome: "Up", rewardAmount: 5200.00, sharesSpent: 3500.00, pnl: 1700.00, txHash: "0xlcl1", timestamp: now - 5 * day },
      { campaignName: "Gold above $4,600 by Wednesday", campaignId: "0xlc2", winnerOutcome: "Up", rewardAmount: 3800.00, sharesSpent: 2200.00, pnl: 1600.00, txHash: "0xlcl2", timestamp: now - 8 * day },
      { campaignName: "Oil above $85.00 by Thursday", campaignId: "0xlc3", winnerOutcome: "Up", rewardAmount: 2100.00, sharesSpent: 1800.00, pnl: 300.00, txHash: "0xlcl3", timestamp: now - 12 * day },
      { campaignName: "BTC above $70,000 last week", campaignId: "0xlc4", winnerOutcome: "Down", rewardAmount: 180.00, sharesSpent: 500.00, pnl: -320.00, txHash: "0xlcl4", timestamp: now - 15 * day },
    ],
    lps: [
      { campaignName: "Will Bitcoin hit $80k this week?", campaignId: "0xllp1", liquidity: 10000.00, isEnded: false, unclaimedRewards: 250.00 },
      { campaignName: "ETH merge impact prediction", campaignId: "0xllp2", liquidity: 5000.00, isEnded: true, unclaimedRewards: 820.00 },
      { campaignName: "Gold $5k prediction", campaignId: "0xllp3", liquidity: 3000.00, isEnded: false, unclaimedRewards: 45.00 },
    ],
  },
];

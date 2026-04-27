import type {
  JackpotStatus,
  LeaderboardAdminConfig,
  LeaderboardEntry,
  LeaderboardOverview,
  LeaderboardPeriod,
  MissionCadence,
  MissionDefinition,
  MissionParams,
  MissionTemplate,
  MissionProgress,
  StreakStatus,
  TierDefinition,
} from "@/types/leaderboardRewards";

const DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULT_MISSION_ICONS = {
  daily_wallet_connect: "🔌",
  daily_trade_once: "📈",
  daily_trade_market_type: "⚡",
  daily_unique_markets: "🗺️",
  weekly_active_days: "🔥",
  weekly_volume_threshold: "💎",
  weekly_referral_count: "🤝",
  weekly_unique_markets: "🧭",
  weekly_lp_hold_threshold: "🏦",
  weekly_creator_volume: "🏗️",
  weekly_referral_volume: "📣",
  weekly_claim_reward: "🏆",
  weekly_simple_mode_trades: "🎟️",
} satisfies Record<MissionTemplate, string>;

export const MISSION_TEMPLATE_CADENCE = {
  daily_wallet_connect: "daily",
  daily_trade_once: "daily",
  daily_trade_market_type: "daily",
  daily_unique_markets: "daily",
  weekly_active_days: "weekly",
  weekly_volume_threshold: "weekly",
  weekly_referral_count: "weekly",
  weekly_unique_markets: "weekly",
  weekly_lp_hold_threshold: "weekly",
  weekly_creator_volume: "weekly",
  weekly_referral_volume: "weekly",
  weekly_claim_reward: "weekly",
  weekly_simple_mode_trades: "weekly",
} satisfies Record<MissionTemplate, MissionCadence>;

export function getDefaultMissionTarget(template: MissionTemplate) {
  switch (template) {
    case "weekly_active_days":
      return 4;
    case "weekly_volume_threshold":
      return 1000;
    case "weekly_referral_count":
      return 3;
    case "daily_unique_markets":
      return 2;
    case "weekly_unique_markets":
      return 5;
    case "weekly_lp_hold_threshold":
      return 2;
    case "weekly_creator_volume":
      return 500;
    case "weekly_referral_volume":
      return 250;
    case "weekly_simple_mode_trades":
      return 5;
    default:
      return 1;
  }
}

export function getDefaultMissionParams(
  template: MissionTemplate,
  target = getDefaultMissionTarget(template),
): MissionParams {
  const base: MissionParams = { target };
  switch (template) {
    case "daily_trade_market_type":
      return { ...base, category: "Hourly", baseAsset: "BTC", minVolume: 0 };
    case "weekly_lp_hold_threshold":
      return { ...base, minLiquidity: 100, minDurationDays: target };
    case "weekly_claim_reward":
      return { ...base, minPayout: 0 };
    default:
      return base;
  }
}

export const DEFAULT_TIERS: TierDefinition[] = [
  {
    id: "stray-cat",
    name: "Stray Cat",
    minPoints: 0,
    iconUrl: "/images/leaderboard/tiers/stray-cat.png",
  },
  {
    id: "house-cat",
    name: "House Cat",
    minPoints: 100,
    iconUrl: "/images/leaderboard/tiers/house-cat.png",
  },
  {
    id: "oracle-cat",
    name: "Oracle Cat",
    minPoints: 300,
    iconUrl: "/images/leaderboard/tiers/oracle-cat.png",
  },
  {
    id: "mystic-cat",
    name: "Mystic Cat",
    minPoints: 500,
    iconUrl: "/images/leaderboard/tiers/mystic-cat.png",
  },
  {
    id: "cosmic-cat",
    name: "Cosmic Cat",
    minPoints: 1000,
    iconUrl: "/images/leaderboard/tiers/cosmic-cat.png",
  },
];

export const DEFAULT_MISSIONS: MissionDefinition[] = [
  {
    id: "daily-wallet-connect",
    title: "Connect wallet for the day",
    description: "Open 9Lives with a connected wallet.",
    icon: "🔌",
    cadence: "daily",
    template: "daily_wallet_connect",
    params: { target: 1 },
    pointReward: 50,
    target: 1,
    displayOrder: 10,
    countsForJackpot: true,
    status: "active",
  },
  {
    id: "daily-trade-once",
    title: "Complete a trade",
    description: "Participate in at least one market today.",
    icon: "📈",
    cadence: "daily",
    template: "daily_trade_once",
    params: { target: 1 },
    pointReward: 50,
    target: 1,
    displayOrder: 20,
    countsForJackpot: true,
    status: "active",
  },
  {
    id: "daily-trade-market-type",
    title: "Trade BTC hourly",
    description: "Participate in one BTC hourly market today.",
    icon: "⚡",
    cadence: "daily",
    template: "daily_trade_market_type",
    params: { target: 1, category: "Hourly", baseAsset: "BTC", minVolume: 0 },
    pointReward: 60,
    target: 1,
    displayOrder: 30,
    countsForJackpot: false,
    status: "draft",
  },
  {
    id: "daily-unique-markets",
    title: "Trade 2 markets today",
    description: "Participate in two different markets today.",
    icon: "🗺️",
    cadence: "daily",
    template: "daily_unique_markets",
    params: { target: 2 },
    pointReward: 80,
    target: 2,
    displayOrder: 40,
    countsForJackpot: false,
    status: "draft",
  },
  {
    id: "weekly-active-days",
    title: "Trade 4 days this week",
    description: "Trade on four different UTC days this week.",
    icon: "🔥",
    cadence: "weekly",
    template: "weekly_active_days",
    params: { target: 4 },
    pointReward: 200,
    target: 4,
    displayOrder: 30,
    countsForJackpot: false,
    status: "active",
  },
  {
    id: "weekly-volume-threshold",
    title: "Reach $1k weekly volume",
    description: "Trade at least 1,000 fUSDC of weekly volume.",
    icon: "💎",
    cadence: "weekly",
    template: "weekly_volume_threshold",
    params: { target: 1000 },
    pointReward: 150,
    target: 1000,
    displayOrder: 40,
    countsForJackpot: false,
    status: "active",
  },
  {
    id: "weekly-referral-count",
    title: "Earn referral fees 3 times",
    description: "Receive referral fee events from referred trades this week.",
    icon: "🤝",
    cadence: "weekly",
    template: "weekly_referral_count",
    params: { target: 3 },
    pointReward: 100,
    target: 3,
    displayOrder: 50,
    countsForJackpot: false,
    status: "active",
  },
  {
    id: "weekly-unique-markets",
    title: "Trade 5 markets this week",
    description: "Participate in five different markets this week.",
    icon: "🧭",
    cadence: "weekly",
    template: "weekly_unique_markets",
    params: { target: 5 },
    pointReward: 200,
    target: 5,
    displayOrder: 60,
    countsForJackpot: false,
    status: "draft",
  },
  {
    id: "weekly-lp-hold-threshold",
    title: "LP for 2 days",
    description: "Keep at least 100 fUSDC-equivalent liquidity active this week.",
    icon: "🏦",
    cadence: "weekly",
    template: "weekly_lp_hold_threshold",
    params: { target: 2, minLiquidity: 100, minDurationDays: 2 },
    pointReward: 250,
    target: 2,
    displayOrder: 70,
    countsForJackpot: false,
    status: "draft",
  },
  {
    id: "weekly-creator-volume",
    title: "Create a $500 market",
    description: "Create markets that generate at least 500 fUSDC volume this week.",
    icon: "🏗️",
    cadence: "weekly",
    template: "weekly_creator_volume",
    params: { target: 500 },
    pointReward: 250,
    target: 500,
    displayOrder: 80,
    countsForJackpot: false,
    status: "draft",
  },
  {
    id: "weekly-referral-volume",
    title: "Drive $250 referral volume",
    description: "Referred wallets generate at least 250 fUSDC volume this week.",
    icon: "📣",
    cadence: "weekly",
    template: "weekly_referral_volume",
    params: { target: 250 },
    pointReward: 200,
    target: 250,
    displayOrder: 90,
    countsForJackpot: false,
    status: "draft",
  },
  {
    id: "weekly-claim-reward",
    title: "Claim a winning market",
    description: "Claim at least one resolved market reward this week.",
    icon: "🏆",
    cadence: "weekly",
    template: "weekly_claim_reward",
    params: { target: 1, minPayout: 0 },
    pointReward: 100,
    target: 1,
    displayOrder: 100,
    countsForJackpot: false,
    status: "draft",
  },
  {
    id: "weekly-simple-mode-trades",
    title: "Use simple mode 5 times",
    description: "Complete five simple-mode trades this week.",
    icon: "🎟️",
    cadence: "weekly",
    template: "weekly_simple_mode_trades",
    params: { target: 5 },
    pointReward: 150,
    target: 5,
    displayOrder: 110,
    countsForJackpot: false,
    status: "draft",
  },
];

export const DEFAULT_ADMIN_CONFIG: LeaderboardAdminConfig = {
  missions: DEFAULT_MISSIONS,
  tiers: DEFAULT_TIERS,
  jackpot: {
    prizeType: "POINTS",
    prizeAmount: 4,
    ticketThreshold: 4,
    status: "open",
  },
};

export function getMissionIcon(mission: Pick<MissionDefinition, "icon" | "template">) {
  return mission.icon || DEFAULT_MISSION_ICONS[mission.template] || "🎯";
}

export function normalizeLeaderboardAdminConfig(
  config: LeaderboardAdminConfig,
): LeaderboardAdminConfig {
  const missionIds = new Set(config.missions.map((mission) => mission.id));
  const upgradedMissions = [
    ...config.missions,
    ...DEFAULT_MISSIONS.filter((mission) => !missionIds.has(mission.id)),
  ];

  return {
    ...config,
    missions: upgradedMissions.map((mission) => ({
      ...mission,
      cadence: MISSION_TEMPLATE_CADENCE[mission.template] || mission.cadence,
      icon: getMissionIcon(mission),
      target: mission.target || getDefaultMissionTarget(mission.template),
      params: {
        ...getDefaultMissionParams(
          mission.template,
          mission.target || getDefaultMissionTarget(mission.template),
        ),
        ...(mission.params || {}),
        target: mission.target || getDefaultMissionTarget(mission.template),
      },
    })),
  };
}

export function normalizeWallet(wallet?: string | null) {
  return wallet?.trim().toLowerCase() || undefined;
}

export function getWeekStart(date = new Date()) {
  const utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const day = new Date(utc).getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  return new Date(utc - daysSinceMonday * DAY_MS);
}

export function getWeekEnd(date = new Date()) {
  return new Date(getWeekStart(date).getTime() + 7 * DAY_MS);
}

export function getTodayStart(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function getTierIndex(points: number, tiers = DEFAULT_TIERS) {
  const ordered = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    if (points >= ordered[i].minPoints) return i;
  }
  return 0;
}

function hashWallet(wallet?: string) {
  if (!wallet) return 0;
  return wallet
    .toLowerCase()
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function fallbackProgressForMission(
  mission: MissionDefinition,
  wallet?: string,
) {
  if (!wallet) return 0;
  const seed = hashWallet(wallet);
  switch (mission.template) {
    case "daily_wallet_connect":
      return 1;
    case "daily_trade_once":
      return seed % 3 === 0 ? 0 : 1;
    case "weekly_active_days":
      return Math.min(mission.target, 1 + (seed % 4));
    case "weekly_volume_threshold":
      return Math.min(mission.target, 250 + (seed % 1200));
    case "weekly_referral_count":
      return Math.min(mission.target, seed % 4);
    case "daily_trade_market_type":
      return seed % 2;
    case "daily_unique_markets":
      return Math.min(mission.target, 1 + (seed % 3));
    case "weekly_unique_markets":
      return Math.min(mission.target, 2 + (seed % 5));
    case "weekly_lp_hold_threshold":
      return Math.min(mission.target, seed % 4);
    case "weekly_creator_volume":
      return Math.min(mission.target, 100 + (seed % 700));
    case "weekly_referral_volume":
      return Math.min(mission.target, seed % 400);
    case "weekly_claim_reward":
      return seed % 3 === 0 ? 1 : 0;
    case "weekly_simple_mode_trades":
      return Math.min(mission.target, seed % 7);
    default:
      return 0;
  }
}

export function buildFallbackMissionProgress(
  cadence: MissionCadence,
  wallet?: string,
  config = DEFAULT_ADMIN_CONFIG,
): MissionProgress[] {
  const now = new Date();
  const dailyStart = getTodayStart(now);
  const weeklyStart = getWeekStart(now);
  const periodStart = cadence === "daily" ? dailyStart : weeklyStart;
  const periodEnd =
    cadence === "daily"
      ? new Date(dailyStart.getTime() + DAY_MS)
      : new Date(weeklyStart.getTime() + 7 * DAY_MS);

  return normalizeLeaderboardAdminConfig(config).missions
    .filter((mission) => mission.status === "active" && mission.cadence === cadence)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((mission) => {
      const progress = fallbackProgressForMission(mission, wallet);
      return {
        ...mission,
        progress,
        completed: progress >= mission.target,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      };
    });
}

export function buildFallbackStreakStatus(
  wallet?: string,
  config = DEFAULT_ADMIN_CONFIG,
): StreakStatus {
  const weekStart = getWeekStart();
  const eligibleDays = wallet ? Math.min(config.jackpot.ticketThreshold, 1 + (hashWallet(wallet) % 4)) : 0;
  const requiredDays = config.jackpot.ticketThreshold;
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return {
    wallet,
    weekStart: weekStart.toISOString(),
    weekEnd: getWeekEnd().toISOString(),
    eligibleDays,
    requiredDays,
    activeStreakDays: eligibleDays,
    boosterMultiplier: eligibleDays >= requiredDays ? 2 : eligibleDays >= 2 ? 1.5 : 1,
    qualifiedForJackpot: eligibleDays >= requiredDays,
    days: dayLabels.map((label, index) => ({
      label,
      date: new Date(weekStart.getTime() + index * DAY_MS).toISOString(),
      complete: index < eligibleDays,
    })),
  };
}

export function buildFallbackJackpotStatus(
  wallet?: string,
  config = DEFAULT_ADMIN_CONFIG,
): JackpotStatus {
  const streak = buildFallbackStreakStatus(wallet, config);
  return {
    wallet,
    weekStart: streak.weekStart,
    weekEnd: streak.weekEnd,
    prizeType: config.jackpot.prizeType,
    prizeAmount: config.jackpot.prizeAmount,
    ticketThreshold: config.jackpot.ticketThreshold,
    eligibleDayCount: streak.eligibleDays,
    ticketCount: streak.qualifiedForJackpot ? 1 : 0,
    qualified: streak.qualifiedForJackpot,
    status: config.jackpot.status,
    totalTickets: 128,
  };
}

export function buildFallbackLeaderboardOverview(
  period: LeaderboardPeriod,
  entries: LeaderboardEntry[],
  wallet?: string,
): LeaderboardOverview {
  const normalizedWallet = normalizeWallet(wallet);
  const self = normalizedWallet
    ? entries.find((entry) => normalizeWallet(entry.wallet) === normalizedWallet)
    : undefined;

  return {
    period,
    generatedAt: new Date().toISOString(),
    entries,
    self,
  };
}

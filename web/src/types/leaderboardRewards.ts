export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "annually";

export type MissionCadence = "daily" | "weekly";

export type MissionTemplate =
  | "daily_wallet_connect"
  | "daily_trade_once"
  | "daily_trade_market_type"
  | "daily_unique_markets"
  | "weekly_active_days"
  | "weekly_volume_threshold"
  | "weekly_referral_count"
  | "weekly_unique_markets"
  | "weekly_lp_hold_threshold"
  | "weekly_creator_volume"
  | "weekly_referral_volume"
  | "weekly_claim_reward"
  | "weekly_simple_mode_trades";

export type MissionStatus = "draft" | "active" | "archived";

export type MissionParamValue = string | number | boolean;

export type MissionParams = Record<string, MissionParamValue>;

export interface TierDefinition {
  id: string;
  name: string;
  minPoints: number;
  iconUrl?: string;
}

export interface MissionDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  cadence: MissionCadence;
  template: MissionTemplate;
  params: MissionParams;
  pointReward: number;
  target: number;
  displayOrder: number;
  countsForJackpot: boolean;
  status: MissionStatus;
}

export interface MissionProgress extends MissionDefinition {
  progress: number;
  completed: boolean;
  periodStart: string;
  periodEnd: string;
}

export interface LeaderboardEntry {
  wallet: string;
  amount: number;
  rank: number;
  pnl?: number;
  volume?: number;
}

export interface LeaderboardOverview {
  period: LeaderboardPeriod;
  generatedAt: string;
  entries: LeaderboardEntry[];
  self?: LeaderboardEntry;
}

export interface StreakStatus {
  wallet?: string;
  weekStart: string;
  weekEnd: string;
  eligibleDays: number;
  requiredDays: number;
  activeStreakDays: number;
  boosterMultiplier: number;
  qualifiedForJackpot: boolean;
  days: Array<{
    label: string;
    date: string;
    complete: boolean;
  }>;
}

export interface JackpotStatus {
  wallet?: string;
  weekStart: string;
  weekEnd: string;
  prizeType: "POINTS" | "CASH";
  prizeAmount: number;
  ticketThreshold: number;
  eligibleDayCount: number;
  ticketCount: number;
  qualified: boolean;
  status: "draft" | "open" | "locked" | "finalized" | "cancelled";
  totalTickets: number;
}

export interface LeaderboardAdminConfig {
  missions: MissionDefinition[];
  tiers: TierDefinition[];
  jackpot: {
    prizeType: "POINTS" | "CASH";
    prizeAmount: number;
    ticketThreshold: number;
    status: JackpotStatus["status"];
  };
}

export interface MissionItem {
  title: string;
  points: string;
  pct: number;
  color: string;
  cur: string;
  tot: string;
}

export type StreakMode = "start" | "active" | "share" | "lost" | "complete";

export interface PState {
  streakDays: number;
  jackpotFilled: number;
  totalPts: number;
  activeStreak: string;
  tierPx: number;
  tierPtsLabel: string;
  booster: number;
  boosterLabel: string;
  streakMode: StreakMode;
  lostDay: number;
  missionBarPx: number;
  selfRank: string;
  daily: MissionItem[];
  weekly: MissionItem[];
  btnText: string;
  btnText2?: string;
  msgBold: string;
  msgBoldColor: string;
  msgNormal: string;
}

export interface TierData {
  name: string;
  requirement: string;
  minPts: number;
}

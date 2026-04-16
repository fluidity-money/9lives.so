import type { PState, TierData } from "./types";

export const TIERS: TierData[] = [
  { name: "Stray Cat", requirement: "HAVE 0+ POINTS", minPts: 0 },
  { name: "House Cat", requirement: "HAVE 100+ POINTS", minPts: 100 },
  { name: "Oracle Cat", requirement: "HAVE 300+ POINTS", minPts: 300 },
  { name: "Mystic Cat", requirement: "HAVE 500+ POINTS", minPts: 500 },
  { name: "Cosmic Cat", requirement: "HAVE 1000+ POINTS", minPts: 1000 },
];

export function getTierIndex(pts: number) {
  let idx = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (pts >= TIERS[i].minPts) {
      idx = i;
      break;
    }
  }
  return idx;
}

export const STATES: PState[] = [
  {
    streakDays: 0, jackpotFilled: 0, totalPts: 324, activeStreak: "4 days",
    tierPx: 153, tierPtsLabel: "500pts", booster: 0, boosterLabel: "0",
    streakMode: "start", lostDay: -1, missionBarPx: 55, selfRank: "#512",
    btnText: "Start a Streak",
    msgBold: "You need 5 days streaks", msgBoldColor: "#0e0e0e",
    msgNormal: " to participate in Weekly Jackpot.",
    daily: [
      { title: "Connect wallet for the day", points: "50pt", pct: 80, color: "#a3a3a3", cur: "1", tot: "1" },
      { title: "Connect wallet for the day", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Place a limit order", points: "30pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Swap any token pair", points: "25pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Add liquidity to a pool", points: "40pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Vote on a governance proposal", points: "20pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
    ],
    weekly: [
      { title: "Trade 5 days this week", points: "200pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "5" },
      { title: "Reach $10k volume", points: "150pt", pct: 0, color: "#a3a3a3", cur: "$0", tot: "$10k" },
      { title: "Refer 3 new users", points: "100pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "3" },
      { title: "Complete all daily missions x3", points: "75pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "3" },
      { title: "Hold position for 48 hours", points: "60pt", pct: 0, color: "#a3a3a3", cur: "0h", tot: "48h" },
    ],
  },
  {
    streakDays: 1, jackpotFilled: 0, totalPts: 374, activeStreak: "5 days",
    tierPx: 170, tierPtsLabel: "500pts", booster: 0, boosterLabel: "0",
    streakMode: "active", lostDay: -1, missionBarPx: 75, selfRank: "#480",
    btnText: "Continue Streak",
    msgBold: "You need 4 more days streak", msgBoldColor: "#0e0e0e",
    msgNormal: " to participate in Weekly Jackpot.",
    daily: [
      { title: "Connect wallet for the day", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Complete a trade", points: "50pt", pct: 30, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Place a limit order", points: "30pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Swap any token pair", points: "25pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Add liquidity to a pool", points: "40pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Vote on a governance proposal", points: "20pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
    ],
    weekly: [
      { title: "Trade 5 days this week", points: "200pt", pct: 20, color: "#a3a3a3", cur: "1", tot: "5" },
      { title: "Reach $10k volume", points: "150pt", pct: 5, color: "#a3a3a3", cur: "$500", tot: "$10k" },
      { title: "Refer 3 new users", points: "100pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "3" },
      { title: "Complete all daily missions x3", points: "75pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "3" },
      { title: "Hold position for 48 hours", points: "60pt", pct: 0, color: "#a3a3a3", cur: "0h", tot: "48h" },
    ],
  },
  {
    streakDays: 2, jackpotFilled: 1, totalPts: 424, activeStreak: "6 days",
    tierPx: 195, tierPtsLabel: "500pts", booster: 1, boosterLabel: "1x",
    streakMode: "share", lostDay: -1, missionBarPx: 105, selfRank: "#312",
    btnText: "Share Your Streak",
    msgBold: "You need 3 more days streak", msgBoldColor: "#ea580c",
    msgNormal: " to participate in Weekly Jackpot.",
    daily: [
      { title: "Connect wallet for the day", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Complete a trade", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Place a limit order", points: "30pt", pct: 60, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Swap any token pair", points: "25pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Add liquidity to a pool", points: "40pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Vote on a governance proposal", points: "20pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
    ],
    weekly: [
      { title: "Trade 5 days this week", points: "200pt", pct: 40, color: "#a3a3a3", cur: "2", tot: "5" },
      { title: "Reach $10k volume", points: "150pt", pct: 20, color: "#a3a3a3", cur: "$2k", tot: "$10k" },
      { title: "Refer 3 new users", points: "100pt", pct: 33, color: "#a3a3a3", cur: "1", tot: "3" },
      { title: "Complete all daily missions x3", points: "75pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "3" },
      { title: "Hold position for 48 hours", points: "60pt", pct: 25, color: "#a3a3a3", cur: "12h", tot: "48h" },
    ],
  },
  {
    streakDays: 3, jackpotFilled: 2, totalPts: 474, activeStreak: "7 days",
    tierPx: 220, tierPtsLabel: "500pts", booster: 1, boosterLabel: "2x",
    streakMode: "share", lostDay: -1, missionBarPx: 130, selfRank: "#198",
    btnText: "Share Your Streak",
    msgBold: "You need 2 more days streak", msgBoldColor: "#ea580c",
    msgNormal: " to participate in Weekly Jackpot.",
    daily: [
      { title: "Connect wallet for the day", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Complete a trade", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Place a limit order", points: "30pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Swap any token pair", points: "25pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Add liquidity to a pool", points: "40pt", pct: 50, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Vote on a governance proposal", points: "20pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
    ],
    weekly: [
      { title: "Trade 5 days this week", points: "200pt", pct: 60, color: "#a3a3a3", cur: "3", tot: "5" },
      { title: "Reach $10k volume", points: "150pt", pct: 45, color: "#a3a3a3", cur: "$4.5k", tot: "$10k" },
      { title: "Refer 3 new users", points: "100pt", pct: 66, color: "#a3a3a3", cur: "2", tot: "3" },
      { title: "Complete all daily missions x3", points: "75pt", pct: 33, color: "#a3a3a3", cur: "1", tot: "3" },
      { title: "Hold position for 48 hours", points: "60pt", pct: 50, color: "#a3a3a3", cur: "24h", tot: "48h" },
    ],
  },
  {
    streakDays: 4, jackpotFilled: 3, totalPts: 524, activeStreak: "8 days",
    tierPx: 260, tierPtsLabel: "500pts", booster: 2, boosterLabel: "3x",
    streakMode: "share", lostDay: -1, missionBarPx: 160, selfRank: "#128",
    btnText: "Share Your Streak",
    msgBold: "You need 5 days streaks", msgBoldColor: "#ea580c",
    msgNormal: " to participate in Weekly Jackpot.",
    daily: [
      { title: "Connect wallet for the day", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Complete a trade", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Place a limit order", points: "30pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Swap any token pair", points: "25pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Add liquidity to a pool", points: "40pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Vote on a governance proposal", points: "20pt", pct: 50, color: "#a3a3a3", cur: "0", tot: "1" },
    ],
    weekly: [
      { title: "Trade 5 days this week", points: "200pt", pct: 80, color: "#a3a3a3", cur: "4", tot: "5" },
      { title: "Reach $10k volume", points: "150pt", pct: 70, color: "#a3a3a3", cur: "$7k", tot: "$10k" },
      { title: "Refer 3 new users", points: "100pt", pct: 100, color: "#0e0e0e", cur: "3", tot: "3" },
      { title: "Complete all daily missions x3", points: "75pt", pct: 66, color: "#a3a3a3", cur: "2", tot: "3" },
      { title: "Hold position for 48 hours", points: "60pt", pct: 100, color: "#0e0e0e", cur: "48h", tot: "48h" },
    ],
  },
  {
    streakDays: 5, jackpotFilled: 4, totalPts: 624, activeStreak: "9 days",
    tierPx: 330, tierPtsLabel: "500pts", booster: 3, boosterLabel: "4x",
    streakMode: "share", lostDay: -1, missionBarPx: 190, selfRank: "#42",
    btnText: "Share Your Streak",
    msgBold: "", msgBoldColor: "",
    msgNormal: "You're eligible for the Weekly Jackpot!",
    daily: [
      { title: "Connect wallet for the day", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Complete a trade", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Place a limit order", points: "30pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Swap any token pair", points: "25pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Add liquidity to a pool", points: "40pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Vote on a governance proposal", points: "20pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
    ],
    weekly: [
      { title: "Trade 5 days this week", points: "200pt", pct: 100, color: "#0e0e0e", cur: "5", tot: "5" },
      { title: "Reach $10k volume", points: "150pt", pct: 90, color: "#a3a3a3", cur: "$9k", tot: "$10k" },
      { title: "Refer 3 new users", points: "100pt", pct: 100, color: "#0e0e0e", cur: "3", tot: "3" },
      { title: "Complete all daily missions x3", points: "75pt", pct: 100, color: "#0e0e0e", cur: "3", tot: "3" },
      { title: "Hold position for 48 hours", points: "60pt", pct: 100, color: "#0e0e0e", cur: "48h", tot: "48h" },
    ],
  },
  {
    streakDays: 7, jackpotFilled: 4, totalPts: 750, activeStreak: "11 days",
    tierPx: 400, tierPtsLabel: "500pts", booster: 5, boosterLabel: "5x",
    streakMode: "complete", lostDay: -1, missionBarPx: 220, selfRank: "#7",
    btnText: "Streak Complete!",
    msgBold: "", msgBoldColor: "",
    msgNormal: "You're eligible for the Weekly Jackpot!",
    daily: [
      { title: "Connect wallet for the day", points: "50pt", pct: 100, color: "#16a34a", cur: "1", tot: "1" },
      { title: "Complete a trade", points: "50pt", pct: 100, color: "#16a34a", cur: "1", tot: "1" },
      { title: "Place a limit order", points: "30pt", pct: 100, color: "#16a34a", cur: "1", tot: "1" },
      { title: "Swap any token pair", points: "25pt", pct: 100, color: "#16a34a", cur: "1", tot: "1" },
      { title: "Add liquidity to a pool", points: "40pt", pct: 100, color: "#16a34a", cur: "1", tot: "1" },
      { title: "Vote on a governance proposal", points: "20pt", pct: 100, color: "#16a34a", cur: "1", tot: "1" },
    ],
    weekly: [
      { title: "Trade 5 days this week", points: "200pt", pct: 100, color: "#16a34a", cur: "5", tot: "5" },
      { title: "Reach $10k volume", points: "150pt", pct: 100, color: "#16a34a", cur: "$10k", tot: "$10k" },
      { title: "Refer 3 new users", points: "100pt", pct: 100, color: "#16a34a", cur: "3", tot: "3" },
      { title: "Complete all daily missions x3", points: "75pt", pct: 100, color: "#16a34a", cur: "3", tot: "3" },
      { title: "Hold position for 48 hours", points: "60pt", pct: 100, color: "#16a34a", cur: "48h", tot: "48h" },
    ],
  },
  {
    streakDays: 0, jackpotFilled: 2, totalPts: 474, activeStreak: "0 days",
    tierPx: 220, tierPtsLabel: "500pts", booster: 0, boosterLabel: "0",
    streakMode: "lost", lostDay: 4, missionBarPx: 130, selfRank: "#198",
    btnText: "Restart", btnText2: "Save Your Streak!",
    msgBold: "You've lost your streak.", msgBoldColor: "#dc2626",
    msgNormal: " Save or Reset by clicking button below:",
    daily: [
      { title: "Connect wallet for the day", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Complete a trade", points: "50pt", pct: 100, color: "#0e0e0e", cur: "1", tot: "1" },
      { title: "Place a limit order", points: "30pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Swap any token pair", points: "25pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Add liquidity to a pool", points: "40pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
      { title: "Vote on a governance proposal", points: "20pt", pct: 0, color: "#a3a3a3", cur: "0", tot: "1" },
    ],
    weekly: [
      { title: "Trade 5 days this week", points: "200pt", pct: 60, color: "#a3a3a3", cur: "3", tot: "5" },
      { title: "Reach $10k volume", points: "150pt", pct: 45, color: "#a3a3a3", cur: "$4.5k", tot: "$10k" },
      { title: "Refer 3 new users", points: "100pt", pct: 66, color: "#a3a3a3", cur: "2", tot: "3" },
      { title: "Complete all daily missions x3", points: "75pt", pct: 33, color: "#a3a3a3", cur: "1", tot: "3" },
      { title: "Hold position for 48 hours", points: "60pt", pct: 50, color: "#a3a3a3", cur: "24h", tot: "48h" },
    ],
  },
];

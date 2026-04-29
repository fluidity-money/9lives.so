"use client";

import {
  buildFallbackJackpotStatus,
  buildFallbackLeaderboardOverview,
  buildFallbackMissionProgress,
  buildFallbackStreakStatus,
  DEFAULT_TIERS,
  normalizeWallet,
} from "@/lib/leaderboardRewards";
import type {
  JackpotStatus,
  LeaderboardEntry,
  LeaderboardOverview,
  LeaderboardPeriod,
  MissionCadence,
  MissionProgress,
  StreakStatus,
  TierDefinition,
} from "@/types/leaderboardRewards";
import { useQuery } from "@tanstack/react-query";

const leaderboardGraphUrl =
  process.env.NEXT_PUBLIC_LEADERBOARD_POINTS_URL ||
  process.env.NEXT_PUBLIC_POINTS_URL;
const legacyPointsGraphUrl = process.env.NEXT_PUBLIC_POINTS_URL;

async function postLeaderboardGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  url = leaderboardGraphUrl,
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`leaderboard graph returned ${res.status}`);
  }

  const payload = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  if (!payload.data) {
    throw new Error("leaderboard graph returned no data");
  }

  return payload.data;
}

async function fetchLegacyNineLivesPoints(wallet?: string) {
  const data = await postLeaderboardGraphQL<{
    ninelivesPoints: Array<{ wallet: string; amount: number; rank: number }>;
  }>(
    `
      query NineLivesPoints($wallet: String) {
        ninelivesPoints(wallet: $wallet) {
          wallet
          amount
          rank
        }
      }
    `,
    { wallet },
    legacyPointsGraphUrl,
  );

  return data.ninelivesPoints;
}

export function useLeaderboardOverview(
  period: LeaderboardPeriod,
  wallet?: string,
) {
  return useQuery({
    queryKey: ["leaderboard-overview", period, wallet],
    queryFn: async () => {
      const normalizedWallet = normalizeWallet(wallet);
      try {
        const data = await postLeaderboardGraphQL<{
          leaderboardOverview: LeaderboardOverview;
        }>(
          `
            query LeaderboardOverview($wallet: String, $period: LeaderboardPeriod!) {
              leaderboardOverview(wallet: $wallet, period: $period) {
                period
                generatedAt
                entries { wallet amount rank pnl volume }
                self { wallet amount rank pnl volume }
              }
            }
          `,
          { wallet: normalizedWallet, period },
        );
        return data.leaderboardOverview;
      } catch {
        const points = await fetchLegacyNineLivesPoints(normalizedWallet).catch(
          () => [],
        );
        const entries: LeaderboardEntry[] = points.map((entry) => ({
          wallet: entry.wallet,
          amount: entry.amount,
          rank: entry.rank,
        }));
        return buildFallbackLeaderboardOverview(
          period,
          entries,
          normalizedWallet,
        );
      }
    },
  });
}

export function useMissionProgress(cadence: MissionCadence, wallet?: string) {
  return useQuery({
    queryKey: ["leaderboard-missions", cadence, wallet],
    queryFn: async () => {
      const normalizedWallet = normalizeWallet(wallet);
      try {
        const data = await postLeaderboardGraphQL<{
          missionProgress: MissionProgress[];
        }>(
          `
            query MissionProgress($wallet: String, $cadence: MissionCadence!) {
              missionProgress(wallet: $wallet, cadence: $cadence) {
                id
                title
                description
                icon
                cadence
                template
                params
                pointReward
                target
                displayOrder
                countsForJackpot
                status
                progress
                completed
                periodStart
                periodEnd
              }
            }
          `,
          { wallet: normalizedWallet, cadence },
        );
        return data.missionProgress;
      } catch {
        return buildFallbackMissionProgress(cadence, normalizedWallet);
      }
    },
  });
}

export function useStreakStatus(wallet?: string) {
  return useQuery({
    queryKey: ["leaderboard-streak", wallet],
    queryFn: async () => {
      const normalizedWallet = normalizeWallet(wallet);
      try {
        const data = await postLeaderboardGraphQL<{ streakStatus: StreakStatus }>(
          `
            query StreakStatus($wallet: String) {
              streakStatus(wallet: $wallet) {
                wallet
                weekStart
                weekEnd
                eligibleDays
                requiredDays
                activeStreakDays
                boosterMultiplier
                qualifiedForJackpot
                days { label date complete }
              }
            }
          `,
          { wallet: normalizedWallet },
        );
        return data.streakStatus;
      } catch {
        return buildFallbackStreakStatus(normalizedWallet);
      }
    },
  });
}

export function useJackpotStatus(wallet?: string) {
  return useQuery({
    queryKey: ["leaderboard-jackpot", wallet],
    queryFn: async () => {
      const normalizedWallet = normalizeWallet(wallet);
      try {
        const data = await postLeaderboardGraphQL<{ jackpotStatus: JackpotStatus }>(
          `
            query JackpotStatus($wallet: String) {
              jackpotStatus(wallet: $wallet) {
                wallet
                weekStart
                weekEnd
                prizeType
                prizeAmount
                ticketThreshold
                eligibleDayCount
                ticketCount
                qualified
                status
                totalTickets
              }
            }
          `,
          { wallet: normalizedWallet },
        );
        return data.jackpotStatus;
      } catch {
        return buildFallbackJackpotStatus(normalizedWallet);
      }
    },
  });
}

export function useLeaderboardTiers() {
  return useQuery({
    queryKey: ["leaderboard-tiers"],
    queryFn: async () => {
      try {
        const data = await postLeaderboardGraphQL<{ tiers: TierDefinition[] }>(
          `
            query Tiers {
              tiers { id name minPoints iconUrl }
            }
          `,
          {},
        );
        return data.tiers;
      } catch {
        return DEFAULT_TIERS;
      }
    },
  });
}

export async function recordWalletConnectMission({
  wallet,
  message,
  signature,
}: {
  wallet: string;
  message: string;
  signature: string;
}) {
  const data = await postLeaderboardGraphQL<{ recordWalletConnect: boolean }>(
    `
      mutation RecordWalletConnect($wallet: String!, $message: String!, $signature: String!) {
        recordWalletConnect(wallet: $wallet, message: $message, signature: $signature)
      }
    `,
    { wallet, message, signature },
  );
  return data.recordWalletConnect;
}

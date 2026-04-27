"use client";

import type {
  JackpotStatus,
  LeaderboardAdminConfig,
  LeaderboardOverview,
  LeaderboardPeriod,
  MissionCadence,
  MissionProgress,
  StreakStatus,
  TierDefinition,
} from "@/types/leaderboardRewards";
import { useQuery } from "@tanstack/react-query";

async function fetchJson<T>(path: string) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Request failed with ${res.status}`);
  return (await res.json()) as T;
}

function walletParam(wallet?: string) {
  return wallet ? `&wallet=${encodeURIComponent(wallet)}` : "";
}

export function useLeaderboardOverview(
  period: LeaderboardPeriod,
  wallet?: string,
) {
  return useQuery({
    queryKey: ["leaderboard-overview", period, wallet],
    queryFn: () =>
      fetchJson<LeaderboardOverview>(
        `/api/leaderboard/overview?period=${period}${walletParam(wallet)}`,
      ),
  });
}

export function useMissionProgress(cadence: MissionCadence, wallet?: string) {
  return useQuery({
    queryKey: ["leaderboard-missions", cadence, wallet],
    queryFn: () =>
      fetchJson<MissionProgress[]>(
        `/api/leaderboard/missions?cadence=${cadence}${walletParam(wallet)}`,
      ),
  });
}

export function useStreakStatus(wallet?: string) {
  return useQuery({
    queryKey: ["leaderboard-streak", wallet],
    queryFn: () =>
      fetchJson<StreakStatus>(
        `/api/leaderboard/streak?wallet=${encodeURIComponent(wallet || "")}`,
      ),
  });
}

export function useJackpotStatus(wallet?: string) {
  return useQuery({
    queryKey: ["leaderboard-jackpot", wallet],
    queryFn: () =>
      fetchJson<JackpotStatus>(
        `/api/leaderboard/jackpot?wallet=${encodeURIComponent(wallet || "")}`,
      ),
  });
}

export function useLeaderboardTiers() {
  return useQuery({
    queryKey: ["leaderboard-tiers"],
    queryFn: () => fetchJson<TierDefinition[]>("/api/leaderboard/tiers"),
  });
}

export function useLeaderboardAdminConfig(enabled: boolean) {
  return useQuery({
    queryKey: ["leaderboard-admin-config"],
    queryFn: () =>
      fetchJson<LeaderboardAdminConfig>("/api/admin/leaderboard/config"),
    enabled,
  });
}

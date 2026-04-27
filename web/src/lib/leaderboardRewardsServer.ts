import appConfig from "@/config";
import {
  buildFallbackJackpotStatus,
  buildFallbackLeaderboardOverview,
  buildFallbackMissionProgress,
  buildFallbackStreakStatus,
  DEFAULT_ADMIN_CONFIG,
  DEFAULT_TIERS,
  normalizeLeaderboardAdminConfig,
  normalizeWallet,
} from "@/lib/leaderboardRewards";
import type {
  JackpotStatus,
  LeaderboardAdminConfig,
  LeaderboardEntry,
  LeaderboardOverview,
  LeaderboardPeriod,
  MissionCadence,
  MissionProgress,
  StreakStatus,
  TierDefinition,
} from "@/types/leaderboardRewards";

type AdminState = {
  config: LeaderboardAdminConfig;
};

declare global {
  // eslint-disable-next-line no-var
  var __leaderboardAdminState: AdminState | undefined;
}

function getAdminState() {
  if (!globalThis.__leaderboardAdminState) {
    globalThis.__leaderboardAdminState = {
      config: normalizeLeaderboardAdminConfig(DEFAULT_ADMIN_CONFIG),
    };
  }
  globalThis.__leaderboardAdminState.config = normalizeLeaderboardAdminConfig(
    globalThis.__leaderboardAdminState.config,
  );
  return globalThis.__leaderboardAdminState;
}

async function postPointsGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  token?: string,
) {
  const res = await fetch(appConfig.NEXT_PUBLIC_POINTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`points graph returned ${res.status}`);
  }

  const payload = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  if (!payload.data) {
    throw new Error("points graph returned no data");
  }

  return payload.data;
}

async function fetchNineLivesPoints(wallet?: string) {
  const data = await postPointsGraphQL<{
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
  );

  return data.ninelivesPoints;
}

export async function getLeaderboardOverview(
  period: LeaderboardPeriod,
  wallet?: string,
): Promise<LeaderboardOverview> {
  const normalizedWallet = normalizeWallet(wallet);

  try {
    const data = await postPointsGraphQL<{
      leaderboardOverview: LeaderboardOverview;
    }>(
      `
        query LeaderboardOverview($wallet: String, $period: String!) {
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
    const points = await fetchNineLivesPoints(normalizedWallet).catch(() => []);
    const entries: LeaderboardEntry[] = points.map((entry) => ({
      wallet: entry.wallet,
      amount: entry.amount,
      rank: entry.rank,
    }));
    return buildFallbackLeaderboardOverview(period, entries, normalizedWallet);
  }
}

export async function getMissionProgress(
  cadence: MissionCadence,
  wallet?: string,
): Promise<MissionProgress[]> {
  const normalizedWallet = normalizeWallet(wallet);

  try {
    const data = await postPointsGraphQL<{
      missionProgress: MissionProgress[];
    }>(
      `
        query MissionProgress($wallet: String, $cadence: String!) {
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
    return buildFallbackMissionProgress(
      cadence,
      normalizedWallet,
      getAdminState().config,
    );
  }
}

export async function getStreakStatus(wallet?: string): Promise<StreakStatus> {
  const normalizedWallet = normalizeWallet(wallet);

  try {
    const data = await postPointsGraphQL<{ streakStatus: StreakStatus }>(
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
    return buildFallbackStreakStatus(normalizedWallet, getAdminState().config);
  }
}

export async function getJackpotStatus(wallet?: string): Promise<JackpotStatus> {
  const normalizedWallet = normalizeWallet(wallet);

  try {
    const data = await postPointsGraphQL<{ jackpotStatus: JackpotStatus }>(
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
    return buildFallbackJackpotStatus(normalizedWallet, getAdminState().config);
  }
}

export async function getTiers(): Promise<TierDefinition[]> {
  try {
    const data = await postPointsGraphQL<{ tiers: TierDefinition[] }>(
      `
        query Tiers {
          tiers { id name minPoints iconUrl }
        }
      `,
      {},
    );

    return data.tiers;
  } catch {
    return getAdminState().config.tiers.length
      ? getAdminState().config.tiers
      : DEFAULT_TIERS;
  }
}

export function getAdminConfig() {
  const state = getAdminState();
  state.config = normalizeLeaderboardAdminConfig(state.config);
  return state.config;
}

export function updateAdminConfig(config: LeaderboardAdminConfig) {
  getAdminState().config = normalizeLeaderboardAdminConfig(config);
  return getAdminState().config;
}

export async function forwardAdminConfig(config: LeaderboardAdminConfig) {
  const token = process.env.POINTS_ADMIN_TOKEN;
  if (!token) return { forwarded: false };

  try {
    await postPointsGraphQL(
      `
        mutation UpdateLeaderboardAdminConfig($config: LeaderboardAdminConfigInput!) {
          updateLeaderboardAdminConfig(config: $config)
        }
      `,
      { config },
      token,
    );
    return { forwarded: true };
  } catch {
    return { forwarded: false };
  }
}

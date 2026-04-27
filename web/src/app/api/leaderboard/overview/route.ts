import { getLeaderboardOverview } from "@/lib/leaderboardRewardsServer";
import type { LeaderboardPeriod } from "@/types/leaderboardRewards";
import { NextResponse } from "next/server";

const periods: LeaderboardPeriod[] = ["daily", "weekly", "monthly", "annually"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const periodParam = url.searchParams.get("period") as LeaderboardPeriod | null;
  const period = periodParam && periods.includes(periodParam) ? periodParam : "daily";
  const wallet = url.searchParams.get("wallet") || undefined;

  return NextResponse.json(await getLeaderboardOverview(period, wallet));
}

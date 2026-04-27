import { getMissionProgress } from "@/lib/leaderboardRewardsServer";
import type { MissionCadence } from "@/types/leaderboardRewards";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cadenceParam = url.searchParams.get("cadence") as MissionCadence | null;
  const cadence = cadenceParam === "weekly" ? "weekly" : "daily";
  const wallet = url.searchParams.get("wallet") || undefined;

  return NextResponse.json(await getMissionProgress(cadence, wallet));
}

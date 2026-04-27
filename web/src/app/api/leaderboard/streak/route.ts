import { getStreakStatus } from "@/lib/leaderboardRewardsServer";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet") || undefined;

  return NextResponse.json(await getStreakStatus(wallet));
}

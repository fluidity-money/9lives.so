import { isLeaderboardAdmin } from "@/lib/leaderboardAdminAuth";
import {
  forwardAdminConfig,
  getAdminConfig,
  updateAdminConfig,
} from "@/lib/leaderboardRewardsServer";
import type { LeaderboardAdminConfig } from "@/types/leaderboardRewards";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isLeaderboardAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(getAdminConfig());
}

export async function POST(request: Request) {
  if (!(await isLeaderboardAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = (await request.json()) as LeaderboardAdminConfig;
  const saved = updateAdminConfig(config);
  const forwarding = await forwardAdminConfig(saved);

  return NextResponse.json({ config: saved, ...forwarding });
}

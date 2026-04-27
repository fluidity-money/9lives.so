import { getTiers } from "@/lib/leaderboardRewardsServer";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(await getTiers());
}

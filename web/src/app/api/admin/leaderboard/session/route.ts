import {
  clearLeaderboardAdminCookie,
  getAdminAuthMessage,
  isAllowedAdminWallet,
  isLeaderboardAdmin,
  isValidAdminPassword,
  isValidAdminWalletSignature,
  setLeaderboardAdminCookie,
} from "@/lib/leaderboardAdminAuth";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    authenticated: await isLeaderboardAdmin(),
    message: getAdminAuthMessage(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    message?: string;
    password?: string;
    signature?: string;
    wallet?: string;
  };

  const validWallet = body.signature
    ? await isValidAdminWalletSignature(body)
    : isAllowedAdminWallet(body.wallet) && process.env.NODE_ENV !== "production";

  if (!isValidAdminPassword(body.password) && !validWallet) {
    return NextResponse.json(
      { authenticated: false, error: "Invalid admin credentials" },
      { status: 401 },
    );
  }

  await setLeaderboardAdminCookie();
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  await clearLeaderboardAdminCookie();
  return NextResponse.json({ authenticated: false });
}

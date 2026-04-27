import { cookies } from "next/headers";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { verifyMessage } from "viem";

const COOKIE_NAME = "leaderboard_admin";
const COOKIE_VALUE = "ok";

export async function isLeaderboardAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE;
}

export function isAllowedAdminWallet(wallet?: string | null) {
  const allowed = process.env.LEADERBOARD_ADMIN_WALLETS;
  if (!wallet || !allowed) return false;
  const normalizedWallet = wallet.toLowerCase();
  return allowed
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalizedWallet);
}

export function getAdminAuthMessage() {
  return (
    process.env.LEADERBOARD_ADMIN_MESSAGE ||
    "Sign in to manage 9Lives leaderboard missions."
  );
}

export async function isValidAdminWalletSignature({
  wallet,
  message,
  signature,
}: {
  wallet?: string | null;
  message?: string | null;
  signature?: string | null;
}) {
  if (!isAllowedAdminWallet(wallet) || message !== getAdminAuthMessage()) {
    return false;
  }

  return await verifyMessage({
    address: wallet as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  }).catch(() => false);
}

export function isValidAdminPassword(password?: string) {
  const expectedHash =
    process.env.LEADERBOARD_ADMIN_PASSWORD_HASH ||
    (process.env.NODE_ENV !== "production"
      ? hashPassword("admin", "leaderboard-dev")
      : undefined);

  if (!expectedHash || !password) return false;
  return safeComparePassword(password, expectedHash);
}

function hashPassword(password: string, salt: string) {
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function safeComparePassword(password: string, expectedHash: string) {
  const [scheme, salt, hash] = expectedHash.trim().split(":");
  if (scheme !== "scrypt" || !salt || !/^[a-f0-9]{64}$/i.test(hash || "")) {
    return false;
  }

  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function setLeaderboardAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearLeaderboardAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

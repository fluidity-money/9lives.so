import type { TierData } from "./types";
import type { TierDefinition } from "@/types/leaderboardRewards";

export const TIER_ICON_URLS = {
  "stray-cat": "/images/leaderboard/tiers/stray-cat.png",
  "house-cat": "/images/leaderboard/tiers/house-cat.png",
  "oracle-cat": "/images/leaderboard/tiers/oracle-cat.png",
  "mystic-cat": "/images/leaderboard/tiers/mystic-cat.png",
  "cosmic-cat": "/images/leaderboard/tiers/cosmic-cat.png",
} as const;

export const TIERS: TierData[] = [
  {
    name: "Stray Cat",
    requirement: "HAVE 0+ POINTS",
    minPts: 0,
    iconUrl: TIER_ICON_URLS["stray-cat"],
  },
  {
    name: "House Cat",
    requirement: "HAVE 100+ POINTS",
    minPts: 100,
    iconUrl: TIER_ICON_URLS["house-cat"],
  },
  {
    name: "Oracle Cat",
    requirement: "HAVE 300+ POINTS",
    minPts: 300,
    iconUrl: TIER_ICON_URLS["oracle-cat"],
  },
  {
    name: "Mystic Cat",
    requirement: "HAVE 500+ POINTS",
    minPts: 500,
    iconUrl: TIER_ICON_URLS["mystic-cat"],
  },
  {
    name: "Cosmic Cat",
    requirement: "HAVE 1000+ POINTS",
    minPts: 1000,
    iconUrl: TIER_ICON_URLS["cosmic-cat"],
  },
];

function tierSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getTierIconUrl(tier: TierDefinition) {
  const slug = tierSlug(tier.name) as keyof typeof TIER_ICON_URLS;
  return tier.iconUrl || TIER_ICON_URLS[slug] || TIER_ICON_URLS["stray-cat"];
}

export function toTierData(tiers?: TierDefinition[]): TierData[] {
  if (!tiers?.length) return TIERS;
  return [...tiers]
    .sort((a, b) => a.minPoints - b.minPoints)
    .map((tier) => ({
      name: tier.name,
      requirement: `HAVE ${tier.minPoints.toLocaleString()}+ POINTS`,
      minPts: tier.minPoints,
      iconUrl: getTierIconUrl(tier),
    }));
}

export function getTierIndex(pts: number, tiers: TierData[] = TIERS) {
  let idx = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (pts >= tiers[i].minPts) {
      idx = i;
      break;
    }
  }
  return idx;
}

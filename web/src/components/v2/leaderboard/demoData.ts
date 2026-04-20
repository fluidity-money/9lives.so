import type { TierData } from "./types";

export const TIERS: TierData[] = [
  { name: "Stray Cat", requirement: "HAVE 0+ POINTS", minPts: 0 },
  { name: "House Cat", requirement: "HAVE 100+ POINTS", minPts: 100 },
  { name: "Oracle Cat", requirement: "HAVE 300+ POINTS", minPts: 300 },
  { name: "Mystic Cat", requirement: "HAVE 500+ POINTS", minPts: 500 },
  { name: "Cosmic Cat", requirement: "HAVE 1000+ POINTS", minPts: 1000 },
];

export function getTierIndex(pts: number) {
  let idx = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (pts >= TIERS[i].minPts) {
      idx = i;
      break;
    }
  }
  return idx;
}

type CampaignWithOdds = { odds: unknown };
type DecodedCampaign<T> = Omit<T, "odds"> & {
  odds: Record<string, string> | null;
};

// Normalize at the API boundary: generated types describe Odds as a string,
// but responses can contain either JSON text or an already-decoded object.
// Validate both forms here without modifying generated code.
export function decodeCampaignOdds<T extends CampaignWithOdds>(
  campaign: T,
): DecodedCampaign<T>;
export function decodeCampaignOdds<T extends CampaignWithOdds>(
  campaign: T | null,
): DecodedCampaign<T> | null;
export function decodeCampaignOdds<T extends CampaignWithOdds>(
  campaign: T | null,
): DecodedCampaign<T> | null {
  if (campaign === null) return null;
  const odds: unknown =
    typeof campaign.odds === "string"
      ? JSON.parse(campaign.odds)
      : campaign.odds;
  if (
    odds !== null &&
    (typeof odds !== "object" ||
      Array.isArray(odds) ||
      !Object.values(odds).every((value) => typeof value === "string"))
  ) {
    throw new Error("Invalid campaign Odds: expected an object of strings");
  }
  return { ...campaign, odds: odds as Record<string, string> | null };
}

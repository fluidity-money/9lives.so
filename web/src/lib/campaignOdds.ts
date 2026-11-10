type CampaignWithOdds = { odds: string | null };
type DecodedCampaign<T> = Omit<T, "odds"> & {
  odds: Record<string, string> | null;
};

// Decode at the API boundary: Graffle's generated types describe Odds as a
// string. Keeping this conversion here avoids runtime-only scalar overrides
// whose decoded types are not reflected in document results.
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
    campaign.odds === null ? null : JSON.parse(campaign.odds);
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

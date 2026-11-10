import { decodeCampaignOdds } from "@/lib/campaignOdds";

describe("decodeCampaignOdds", () => {
  it("decodes odds while preserving campaign fields and the original input", () => {
    const campaign = { identifier: "test", odds: '{"yes":"0.75","no":"0.25"}' };
    expect(decodeCampaignOdds(campaign)).toEqual({
      identifier: "test",
      odds: { yes: "0.75", no: "0.25" },
    });
    expect(typeof campaign.odds).toBe("string");
  });

  it("preserves null campaigns and null odds", () => {
    expect(decodeCampaignOdds(null)).toBeNull();
    expect(decodeCampaignOdds({ identifier: "test", odds: null })).toEqual({
      identifier: "test",
      odds: null,
    });
  });

  it.each(["[]", "42", '"text"', '{"yes":0.75}'])(
    "rejects invalid odds shapes: %s",
    (odds) => {
      expect(() => decodeCampaignOdds({ odds })).toThrow(
        "Invalid campaign Odds",
      );
    },
  );

  it("accepts already-decoded odds and can be applied twice", () => {
    const campaign = { identifier: "test", odds: { yes: "0.75", no: "0.25" } };
    expect(decodeCampaignOdds(campaign)).toEqual(campaign);
    expect(decodeCampaignOdds(decodeCampaignOdds(campaign))).toEqual(campaign);
  });

  it.each([undefined, 42, true, [], { yes: 0.75 }])(
    "rejects invalid non-string odds: %p",
    (odds) => {
      expect(() => decodeCampaignOdds({ odds })).toThrow(
        "Invalid campaign Odds",
      );
    },
  );

  it("rejects malformed JSON", () => {
    expect(() => decodeCampaignOdds({ odds: "not JSON" })).toThrow();
  });
});

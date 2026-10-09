import {
  executeRfqhubAuthenticated,
  rfqhubData,
  rfqhubRootData,
  rfqhubSuggestionTimestamps,
} from "@/lib/rfqhub";

describe("rfqhubSuggestionTimestamps", () => {
  it("converts option and bidding durations to absolute Unix timestamps", () => {
    expect(
      rfqhubSuggestionTimestamps({
        durationSeconds: 86_400,
        biddingWindowSeconds: 3_600,
        nowSeconds: 1_800_000_000,
      }),
    ).toEqual({
      expiry: 1_800_086_400,
      deadline: 1_800_003_600,
    });
  });

  it.each([
    ["zero option duration", 0, 1, 1_800_000_000],
    ["fractional option duration", 1.5, 1, 1_800_000_000],
    ["zero bidding window", 10, 0, 1_800_000_000],
    ["bidding window after expiry", 10, 11, 1_800_000_000],
    ["fractional current time", 10, 1, 1_800_000_000.5],
    ["GraphQL Int timestamp overflow", 1, 1, 2_147_483_647],
  ])(
    "rejects %s",
    (_name, durationSeconds, biddingWindowSeconds, nowSeconds) => {
      expect(() =>
        rfqhubSuggestionTimestamps({
          durationSeconds,
          biddingWindowSeconds,
          nowSeconds,
        }),
      ).toThrow();
    },
  );
});

describe("rfqhubData", () => {
  it("returns data from a successful Graffle HTTP envelope", () => {
    expect(
      rfqhubData({
        response: { status: 200 },
        data: { bundleId: 7 },
        errors: undefined,
      }),
    ).toEqual({ bundleId: 7 });
  });

  it("unwraps the selected root field from a Graffle operation envelope", () => {
    expect(
      rfqhubRootData(
        {
          response: { status: 200 },
          data: { createAuctionServerSig: { bundleId: 7 } },
        },
        "createAuctionServerSig",
      ),
    ).toEqual({ bundleId: 7 });
  });

  it("rejects GraphQL errors even when HTTP succeeds", () => {
    expect(() =>
      rfqhubData({
        response: { status: 200 },
        data: undefined,
        errors: [{ message: "failed" }],
      }),
    ).toThrow("failed");
  });
});

describe("executeRfqhubAuthenticated", () => {
  it("refreshes the secret and retries once after an unauthorized response", async () => {
    const request = jest
      .fn<Promise<string>, [{ eoaAddress: string; secret: string }]>()
      .mockImplementationOnce(async () =>
        rfqhubData<string>({
          response: { status: 401 },
          data: undefined,
          errors: undefined,
        }),
      )
      .mockResolvedValueOnce("created");
    const refreshSecret = jest.fn().mockResolvedValue("fresh-secret");

    await expect(
      executeRfqhubAuthenticated({
        eoaAddress: "0x1234",
        secret: "stale-secret",
        refreshSecret,
        request,
      }),
    ).resolves.toBe("created");
    expect(refreshSecret).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenNthCalledWith(1, {
      eoaAddress: "0x1234",
      secret: "stale-secret",
    });
    expect(request).toHaveBeenNthCalledWith(2, {
      eoaAddress: "0x1234",
      secret: "fresh-secret",
    });
  });

  it("does not refresh or retry non-authorization failures", async () => {
    const error = { response: { status: 500 } };
    const request = jest.fn().mockRejectedValue(error);
    const refreshSecret = jest.fn().mockResolvedValue("fresh-secret");

    await expect(
      executeRfqhubAuthenticated({
        eoaAddress: "0x1234",
        secret: "secret",
        refreshSecret,
        request,
      }),
    ).rejects.toBe(error);
    expect(refreshSecret).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(1);
  });
});

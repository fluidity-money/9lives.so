import {
  applyRfqhubMakerMatch,
  minimumRfqhubOffer,
  filterActiveRfqhubRequests,
  parseRfqhubMessage,
  parseRfqhubRequestMessage,
  resolveRfqhubWebsocketUrl,
} from "@/lib/rfqhubRequests";

describe("RFQHub websocket taker advertisements", () => {
  it("parses the BundleTaker envelope advertised by RFQHub", () => {
    expect(
      parseRfqhubRequestMessage(
        JSON.stringify({
          BundleTaker: {
            id: 7,
            acc_addr: "0x1234",
            asset: "0xabcd",
            amt: 1_000_000,
            min_offer: 100_000,
            created_by: "2026-10-14T11:00:00Z",
            decay_rate: 0,
            is_up: true,
            price_target: 9_999_999,
            outcome: "BitcoinPrice",
            deadline: "2026-10-14T12:00:00Z",
            expiry: "2026-10-14T13:00:00Z",
            structure: {
              args: {},
              sig: [],
            },
          },
        }),
      ),
    ).toEqual([
      {
        id: "7",
        accountAddress: "0x1234",
        asset: "0xabcd",
        amount: "1000000",
        minOffer: "100000",
        createdBy: "2026-10-14T11:00:00Z",
        decayRate: 0,
        isUp: true,
        priceTarget: "9999999",
        outcome: "BitcoinPrice",
        deadline: "2026-10-14T12:00:00Z",
        expiry: "2026-10-14T13:00:00Z",
        structure: {
          args: {},
          sig: [],
        },
      },
    ]);
  });

  it("rejects unrelated envelopes and malformed takers", () => {
    expect(parseRfqhubRequestMessage(JSON.stringify({ Ping: {} }))).toEqual([]);
    expect(
      parseRfqhubRequestMessage(
        JSON.stringify({
          BundleTaker: {
            id: 7,
            acc_addr: "0x1234",
            asset: "0xabcd",
            amt: 1_000_000,
            min_offer: 100_000,
            created_by: "2026-10-14T11:00:00Z",
            decay_rate: 0,
            is_up: "true",
            price_target: 9_999_999,
            outcome: "BitcoinPrice",
            deadline: "not-a-date",
            expiry: "2026-10-14T13:00:00Z",
            structure: { args: {}, sig: [] },
          },
        }),
      ),
    ).toEqual([]);
    expect(parseRfqhubRequestMessage("not json")).toEqual([]);
  });

  it("parses BundleMaker matches and raises the matching taker's minimum by $1", () => {
    const makerMessage = parseRfqhubMessage(
      JSON.stringify({
        BundleMaker: {
          acc_addr: "0x5678",
          amt: 5_000_000,
          bundle_taker_id: 7,
        },
      }),
    );
    expect(makerMessage).toEqual({
      type: "maker",
      match: {
        accountAddress: "0x5678",
        amount: "5000000",
        bundleTakerId: "7",
      },
    });

    const requests = parseRfqhubRequestMessage(
      JSON.stringify({
        BundleTaker: {
          id: 7,
          acc_addr: "0x1234",
          asset: "0xabcd",
          amt: 10_000_000,
          min_offer: 100_000,
          created_by: "2026-10-14T11:00:00Z",
          decay_rate: 0,
          is_up: true,
          price_target: 9_999_999,
          outcome: "BitcoinPrice",
          deadline: "2026-10-14T12:00:00Z",
          expiry: "2026-10-14T13:00:00Z",
          structure: { args: {}, sig: [] },
        },
      }),
    );

    if (makerMessage?.type !== "maker") throw new Error("Expected maker match");
    const updated = applyRfqhubMakerMatch(requests, makerMessage.match);
    expect(updated[0]).toMatchObject({
      id: "7",
      minOffer: "100000",
      makerOffer: "5000000",
      matchVersion: 1,
    });

    expect(
      applyRfqhubMakerMatch(updated, {
        ...makerMessage.match,
        amount: "7000000",
      })[0],
    ).toMatchObject({
      minOffer: "100000",
      makerOffer: "7000000",
      matchVersion: 2,
    });
    expect(minimumRfqhubOffer(updated[0]!)).toBe(BigInt(5100000));
  });

  it("uses the dedicated RFQHub websocket endpoint", () => {
    expect(resolveRfqhubWebsocketUrl()).toBe("wss://rfqhub-ws.9lives.so/");
    expect(resolveRfqhubWebsocketUrl("https://example.com/feed")).toBe(
      "wss://example.com/feed",
    );
  });

  it("removes takers as soon as their bidding deadline passes", () => {
    const parsed = parseRfqhubRequestMessage(
      JSON.stringify({
        BundleTaker: {
          id: 7,
          acc_addr: "0x1234",
          asset: "0xabcd",
          amt: 1_000_000,
          min_offer: 100_000,
          created_by: "2026-10-14T11:00:00Z",
          decay_rate: 0,
          is_up: true,
          price_target: 9_999_999,
          outcome: "BitcoinPrice",
          deadline: "2026-10-14T12:00:00Z",
          expiry: "2026-10-14T13:00:00Z",
          structure: { args: {}, sig: [] },
        },
      }),
    );

    expect(
      filterActiveRfqhubRequests(parsed, Date.parse("2026-10-14T11:59:59Z")),
    ).toHaveLength(1);
    expect(
      filterActiveRfqhubRequests(parsed, Date.parse("2026-10-14T12:00:00Z")),
    ).toEqual([]);
  });
});

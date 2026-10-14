import {
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

  it("uses the dedicated RFQHub websocket endpoint", () => {
    expect(resolveRfqhubWebsocketUrl()).toBe("wss://rfqhub-ws.9lives.so/");
    expect(resolveRfqhubWebsocketUrl("https://example.com/feed")).toBe(
      "wss://example.com/feed",
    );
  });
});

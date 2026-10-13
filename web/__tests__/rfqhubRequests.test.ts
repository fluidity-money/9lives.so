import {
  parseRfqhubRequest,
  parseRfqhubRequestMessage,
} from "@/lib/rfqhubRequests";

describe("RFQHub websocket request parsing", () => {
  it("parses maker inserts from the RFQHub websocket table", () => {
    expect(
      parseRfqhubRequestMessage(
        JSON.stringify({
          table: "rfqhub_bundles_maker_1",
          content: {
            id: 12,
            created_by: "2026-10-13T12:01:00Z",
            acc_addr: "0x1234",
            bundle_taker_id: 8,
            amt: 25_000_000,
          },
        }),
      ),
    ).toEqual([
      {
        id: "12",
        bundleTakerId: 8,
        amount: "25000000",
        createdAt: "2026-10-13T12:01:00Z",
        accountAddress: "0x1234",
      },
    ]);
  });

  it("parses snapshots and ignores other tables or malformed rows", () => {
    expect(
      parseRfqhubRequestMessage(
        JSON.stringify({
          snapshot_toplevel: [
            {
              table: "rfqhub_bundles_maker_1",
              snapshot: [
                { id: "2", bundle_taker_id: 9, amt: "1000000" },
                { id: "missing-amount", bundle_taker_id: 9 },
              ],
            },
            {
              table: "rfqhub_bundles_taker_1",
              content: { id: 1, bundle_taker_id: 9, amt: 1 },
            },
          ],
        }),
      ),
    ).toEqual([
      {
        id: "2",
        bundleTakerId: 9,
        amount: "1000000",
        createdAt: undefined,
        accountAddress: undefined,
      },
    ]);
    expect(parseRfqhubRequest({ id: 1, bundle_taker_id: -1, amt: 1 })).toBe(
      undefined,
    );
    expect(parseRfqhubRequestMessage("not json")).toEqual([]);
  });
});

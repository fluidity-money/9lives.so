import { act, renderHook } from "@testing-library/react";
import useRfqhubRequests from "@/hooks/useRfqhubRequests";
import { minimumRfqhubOffer, parseRfqhubMessage } from "@/lib/rfqhubRequests";

jest.mock("../src/config", () => ({ __esModule: true, default: {} }));

const taker = {
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
};
const maker = { acc_addr: "0x5678", amt: 5_000_000, bundle_taker_id: 7 };
const snapshot = { BundleTakers: [taker], BundleMakers: [maker] };

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onopen?: () => void;
  onclose?: () => void;
  onmessage?: (event: { data: string }) => void;
  onerror?: () => void;
  constructor() {
    MockWebSocket.instances.push(this);
  }
  close() {
    this.onclose?.();
  }
  receive(value: unknown) {
    this.onmessage?.({ data: JSON.stringify(value) });
  }
}

describe("RFQHub combined snapshots", () => {
  const originalWebSocket = global.WebSocket;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-14T11:00:00Z"));
    MockWebSocket.instances = [];
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });
  afterEach(() => {
    global.WebSocket = originalWebSocket;
    jest.useRealTimers();
  });

  it("parses both lists in the same envelope, including empty snapshots", () => {
    expect(parseRfqhubMessage(JSON.stringify(snapshot))).toMatchObject({
      type: "snapshot",
      requests: [{ id: "7" }],
      matches: [{ bundleTakerId: "7", amount: "5000000" }],
    });
    expect(
      parseRfqhubMessage(
        JSON.stringify({ BundleTakers: [], BundleMakers: [] }),
      ),
    ).toEqual({
      type: "snapshot",
      requests: [],
      matches: [],
    });
  });

  it("replaces stale requests with already-quoted takers and keeps live updates", () => {
    const observedOffers: (string | undefined)[] = [];
    const { result, unmount } = renderHook(() => {
      const state = useRfqhubRequests();
      for (const request of state.requests) {
        if (request.id === "7") observedOffers.push(request.makerOffer);
      }
      return state;
    });
    const socket = MockWebSocket.instances[0]!;
    act(() => socket.receive({ BundleTaker: { ...taker, id: 8 } }));
    expect(result.current.requests.map((request) => request.id)).toEqual(["8"]);
    act(() => socket.receive(snapshot));
    expect(result.current.requests).toHaveLength(1);
    expect(result.current.requests[0]).toMatchObject({
      id: "7",
      makerOffer: "5000000",
    });
    expect(minimumRfqhubOffer(result.current.requests[0]!)).toBe(
      BigInt(6_000_000),
    );
    expect(observedOffers.length).toBeGreaterThan(0);
    expect(observedOffers.every((offer) => offer === "5000000")).toBe(true);
    act(() => socket.receive({ BundleMaker: { ...maker, amt: 7_000_000 } }));
    expect(minimumRfqhubOffer(result.current.requests[0]!)).toBe(
      BigInt(8_000_000),
    );
    unmount();
  });

  it("clears stale state when reconnect receives an empty snapshot", () => {
    const { result, unmount } = renderHook(() => useRfqhubRequests());
    const socket = MockWebSocket.instances[0]!;
    act(() => {
      socket.onopen?.();
      socket.receive(snapshot);
    });
    expect(result.current.requests).toHaveLength(1);
    act(() => socket.close());
    act(() => jest.advanceTimersByTime(1_000));
    expect(MockWebSocket.instances).toHaveLength(2);
    expect(result.current.requests).toHaveLength(1);
    act(() => {
      const reconnected = MockWebSocket.instances[1]!;
      reconnected.onopen?.();
      reconnected.receive({ BundleTakers: [], BundleMakers: [] });
    });
    expect(result.current.requests).toEqual([]);
    expect(result.current.connectionStatus).toBe("connected");
    unmount();
  });
});

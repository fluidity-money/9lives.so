import { act, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAssetPrices from "@/hooks/useAssetPrices";
import RfqhubPriceChart from "@/components/rfqhub/rfqhubPriceChart";
import RfqhubPage from "@/app/(v2)/rfqhub/page";

jest.mock("../src/config", () => ({
  __esModule: true,
  default: {
    NEXT_PUBLIC_WS_URL: "wss://prices.test",
    simpleMarkets: { btc: { decimals: 2 } },
  },
}));
const mounted = jest.fn();
jest.mock("liveline", () => ({
  Liveline: (props: { data: unknown[]; value: number }) => {
    useEffect(() => {
      mounted();
    }, []);
    return <output data-testid="chart">{JSON.stringify(props)}</output>;
  },
}));
jest.mock("../src/components/rfqhub/rfqhubPrototype", () => ({
  __esModule: true,
  default: () => <div>Independent RFQ</div>,
}));
jest.mock("../src/providers/graphqlClient", () => ({
  requestSimpleMarket: () => {
    throw new Error("RFQ must not fetch DPPM");
  },
}));

class Socket {
  static instances: Socket[] = [];
  onopen?: () => void;
  onmessage?: (event: { data: string }) => void;
  onclose?: () => void;
  onerror?: () => void;
  send = jest.fn();
  close = jest.fn(() => this.onclose?.());
  constructor() {
    Socket.instances.push(this);
  }
  receive(message: unknown) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
}
const table = "oracles_ninelives_prices_2";
const row = (id: number, created_by: string, amount = 65000, base = "BTC") => ({
  id,
  created_by,
  amount,
  base,
});
function Feed() {
  const { prices, connected } = useAssetPrices("btc");
  return (
    <>
      <output data-testid="price-ready">{String(connected)}</output>
      <RfqhubPriceChart prices={prices} />
    </>
  );
}
const originalWebSocket = global.WebSocket;
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date("2026-10-15T12:14:59Z"));
  Socket.instances = [];
  global.WebSocket = Socket as unknown as typeof WebSocket;
});
afterEach(() => {
  global.WebSocket = originalWebSocket;
  jest.useRealTimers();
});
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <Feed />
    </QueryClientProvider>,
  );
  const socket = Socket.instances[0];
  act(() => socket.onopen?.());
  const flush = () =>
    act(() => {
      jest.advanceTimersByTime(1);
    });
  const chart = () => JSON.parse(screen.getByTestId("chart").textContent!);
  return { ...view, socket, flush, chart };
}

it("waits for a fresh delivery after reconnect while keeping chart history", () => {
  const { socket, chart, flush } = setup();
  expect(screen.getByTestId("price-ready").textContent).toBe("false");
  act(() => socket.receive({ table, content: row(1, "2026-10-15T12:14:59Z") }));
  flush();
  expect(screen.getByTestId("price-ready").textContent).toBe("true");
  act(() => socket.close());
  act(() => jest.advanceTimersByTime(1000));
  act(() => Socket.instances[1].onopen?.());
  expect(screen.getByTestId("price-ready").textContent).toBe("false");
  expect(chart().data).toHaveLength(1);
  act(() =>
    Socket.instances[1].receive({
      table,
      content: row(2, "2026-10-15T12:15:01Z"),
    }),
  );
  flush();
  expect(screen.getByTestId("price-ready").textContent).toBe("true");
  expect(chart().data).toHaveLength(2);
});

it("renders the route without fetching an available DPPM market", async () => {
  render(await RfqhubPage());
  expect(screen.getByText("Independent RFQ")).not.toBeNull();
});

it("keeps the same chart and socket across DPPM expiry and rollover", () => {
  const { socket, flush, chart } = setup();
  const subscription = {
    table,
    fields: [{ name: "base", filter_constraints: { et: "BTC" } }],
  };
  expect(JSON.parse(socket.send.mock.calls[0][0])).toEqual({
    ask_for_snapshot: [subscription],
    add: [subscription],
  });
  act(() =>
    socket.receive({
      table: "",
      snapshot_toplevel: [
        { table, snapshot: [row(1, "2026-10-15T12:14:59Z")] },
      ],
    }),
  );
  flush();
  act(() => {
    jest.advanceTimersByTime(2000);
    socket.receive({
      table: "ninelives_campaigns_1",
      content: { ending: 1792066500 },
    });
    socket.receive({
      table,
      content: row(2, "2026-10-15T12:15:01Z", 65001.123456),
    });
  });
  flush();
  expect(chart().data).toHaveLength(2);
  expect(chart().value).toBe(65001.123456);
  expect(chart().referenceLine).toBeUndefined();
  expect(chart().paused).toBeUndefined();
  expect(Socket.instances).toHaveLength(1);
  expect(socket.close).not.toHaveBeenCalled();
  expect(mounted).toHaveBeenCalledTimes(1);
});

it("merges reconnect snapshots without losing newer ticks; ignores malformed and other-asset data", () => {
  const { socket, flush, chart, unmount } = setup();
  act(() =>
    socket.receive({ table, content: row(3, "2026-10-15T12:15:03Z", 65003) }),
  );
  act(() => socket.close());
  act(() => jest.advanceTimersByTime(1000));
  const next = Socket.instances[1];
  act(() => {
    next.onopen?.();
    next.receive({
      table: "",
      snapshot_toplevel: [
        { table: "other", snapshot: [] },
        {
          table,
          snapshot: [
            row(2, "2026-10-15T12:15:02Z", 65002),
            row(3, "2026-10-15T12:15:03Z", 65003),
            row(1, "2026-10-15T12:15:01Z", 65001),
          ],
        },
      ],
    });
    next.receive({ table, content: row(4, "invalid", 1) });
    next.receive({ table, content: row(5, "2026-10-15T12:15:05Z", 10, "ETH") });
    next.receive({ table, content: row(6, "2026-10-15T12:15:06Z", -1) });
    next.receive(null);
  });
  flush();
  expect(chart().data.map((p: { value: number }) => p.value)).toEqual([
    65001, 65002, 65003,
  ]);
  expect(chart().value).toBe(65003);
  unmount();
  act(() => jest.advanceTimersByTime(30000));
  expect(Socket.instances).toHaveLength(2);
});

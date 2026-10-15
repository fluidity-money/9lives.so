import { fireEvent, render, screen } from "@testing-library/react";
import RfqhubPriceChart from "@/components/rfqhub/rfqhubPriceChart";
import { rfqhubChartGeometry } from "@/lib/rfqhubChart";
import type { RfqhubIncomingRequest } from "@/lib/rfqhubRequests";

jest.mock("../src/config", () => ({
  __esModule: true,
  default: { simpleMarkets: { btc: { decimals: 2 } } },
}));
const now = Date.parse("2026-10-15T12:15:00Z");
const prices = [
  { id: 1, timestamp: now - 1_200_000, price: 60000 },
  { id: 2, timestamp: now - 600_000, price: 64000 },
  { id: 3, timestamp: now - 120_000, price: 64990 },
  { id: 4, timestamp: now - 30_000, price: 65000 },
  { id: 5, timestamp: now, price: 65001 },
];
const request: RfqhubIncomingRequest = {
  id: "7",
  accountAddress: "0x123",
  asset: "0xabcd",
  amount: "1000000",
  minOffer: null,
  createdBy: new Date(now - 120_000).toISOString(),
  decayRate: 0,
  isUp: true,
  priceTarget: "65000500000",
  outcome: "BitcoinPrice",
  deadline: new Date(now - 60_000).toISOString(),
  expiry: new Date(now + 300_000).toISOString(),
  structure: { args: {}, sig: [] },
};
const path = () => screen.getByTestId("oracle-path").getAttribute("d");
const count = () => path()?.match(/[ML]/g)?.length;
const select = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

it("defaults to a trailing minute with small padding and visible-only price scaling", () => {
  const position = {
    id: "1",
    start: now - 9_000_000,
    end: now + 9_000_000,
    target: 1000000,
    isUp: true,
  };
  const g = rfqhubChartGeometry(prices, [position]);
  expect(g.start).toBe(now - 60_000);
  expect(g.end).toBe(now + 2400);
  expect(g.min).toBeGreaterThan(64999);
  expect(g.max).toBeLessThan(65002);
  expect(g.data).toEqual(prices.slice(-2));
  expect(g.latest).toEqual(prices.at(-1));
  const plain = rfqhubChartGeometry(prices, []);
  expect([g.start, g.end, g.min, g.max]).toEqual([
    plain.start,
    plain.end,
    plain.min,
    plain.max,
  ]);
  expect(rfqhubChartGeometry(prices, [], "5m").data).toHaveLength(3);
  expect(rfqhubChartGeometry(prices, [], "15m").data).toHaveLength(4);
  expect(rfqhubChartGeometry(prices, [position], "All").data).toHaveLength(5);
  expect(rfqhubChartGeometry(prices, [position], "All").max).toBeLessThan(
    66000,
  );
});

it("clips both segment boundaries without inventing an expiry dot or future oracle point", () => {
  const { rerender } = render(
    <RfqhubPriceChart prices={prices} requests={[request]} />,
  );
  const line = screen.getByTestId("position-segment");
  expect(line.getAttribute("x1")).toBe("90");
  expect(line.getAttribute("x2")).toBe("750");
  expect(screen.queryByTestId("position-end")).toBeNull();
  expect(count()).toBe(2);
  expect(
    Number(screen.getByTestId("oracle-end").getAttribute("cx")),
  ).toBeLessThan(750);
  rerender(
    <RfqhubPriceChart
      prices={prices}
      requests={[{ ...request, expiry: new Date(now - 10_000).toISOString() }]}
    />,
  );
  expect(screen.getByTestId("position-end").getAttribute("cx")).toBe(
    screen.getByTestId("position-segment").getAttribute("x2"),
  );
  rerender(
    <RfqhubPriceChart
      prices={prices}
      requests={[{ ...request, priceTarget: "99000000000" }]}
    />,
  );
  expect(screen.queryByTestId("position-segment")).toBeNull();
});

it("zooms out/rezooms and preserves selection and live following through ticks and request changes", () => {
  const { rerender } = render(<RfqhubPriceChart prices={prices} />);
  const svg = screen.getByRole("img", { name: /Live BTC price/ });
  const initial = path();
  expect(count()).toBe(2);
  select("5m");
  expect(count()).toBe(3);
  select("15m");
  expect(count()).toBe(4);
  select("All");
  expect(count()).toBe(5);
  select("1m");
  expect(path()).toBe(initial);
  select("5m");
  const next = [...prices, { id: 6, timestamp: now + 10_000, price: 65002 }];
  rerender(<RfqhubPriceChart prices={next} requests={[request]} />);
  expect(
    screen.getByRole("button", { name: "5m" }).getAttribute("aria-pressed"),
  ).toBe("true");
  expect(screen.getByRole("img", { name: /Live BTC price/ })).toBe(svg);
  const geometry = rfqhubChartGeometry(next, [], "5m");
  expect(Number(screen.getByTestId("oracle-end").getAttribute("cx"))).toBe(
    geometry.x(now + 10_000),
  );
  const annotatedPath = path();
  rerender(<RfqhubPriceChart prices={next} requests={[]} />);
  expect(path()).toBe(annotatedPath);
  expect(
    screen.getByRole("button", { name: "5m" }).getAttribute("aria-pressed"),
  ).toBe("true");
  select("1m");
  expect(count()).toBe(3);
});

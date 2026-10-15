import { render, screen } from "@testing-library/react";
import RfqhubPriceChart from "@/components/rfqhub/rfqhubPriceChart";
import { rfqhubChartGeometry, rfqhubChartPositions } from "@/lib/rfqhubChart";
import type { RfqhubIncomingRequest } from "@/lib/rfqhubRequests";

jest.mock("../src/config", () => ({
  __esModule: true,
  default: { simpleMarkets: { btc: { decimals: 2 } } },
}));
jest.mock("liveline", () => ({
  Liveline: () => <div>Unannotated live chart</div>,
}));
const request: RfqhubIncomingRequest = {
  id: "7",
  accountAddress: "0x123",
  asset: "0xabcd",
  amount: "1000000",
  minOffer: null,
  createdBy: "2026-10-15T12:00:00Z",
  decayRate: 0,
  isUp: true,
  priceTarget: "65000123456",
  outcome: "BitcoinPrice",
  deadline: "2026-10-15T12:01:00Z",
  expiry: "2026-10-15T12:05:00Z",
  structure: { args: {}, sig: [] },
};
const prices = [
  { id: 1, timestamp: Date.parse(request.createdBy), price: 65000 },
  { id: 2, timestamp: Date.parse(request.deadline), price: 65001 },
];

it("converts six-decimal targets and uses expiry, never the bidding deadline", () => {
  expect(rfqhubChartPositions([request])).toEqual([
    {
      id: "7",
      target: 65000.123456,
      start: prices[0].timestamp,
      end: Date.parse(request.expiry),
      isUp: true,
    },
  ]);
});

it("draws multiple true horizontal segments and expiry markers on shared price/time scales", () => {
  const requests = [
    request,
    {
      ...request,
      id: "8",
      isUp: false,
      priceTarget: "64000000000",
      expiry: "2026-10-15T12:10:00Z",
    },
  ];
  const positions = rfqhubChartPositions(requests);
  const geometry = rfqhubChartGeometry(prices, positions);
  render(<RfqhubPriceChart prices={prices} requests={requests} />);
  const lines = screen.getAllByTestId("position-segment");
  const ends = screen.getAllByTestId("position-end");
  expect(lines).toHaveLength(2);
  positions.forEach((p, i) => {
    expect(Number(lines[i].getAttribute("x1"))).toBe(geometry.x(p.start));
    expect(Number(lines[i].getAttribute("x2"))).toBe(geometry.x(p.end));
    expect(lines[i].getAttribute("y1")).toBe(lines[i].getAttribute("y2"));
    expect(Number(lines[i].getAttribute("y1"))).toBe(geometry.y(p.target));
    expect(ends[i].getAttribute("cx")).toBe(lines[i].getAttribute("x2"));
  });
  expect(
    Number(screen.getByTestId("oracle-end").getAttribute("cx")),
  ).toBeLessThan(Number(ends[0].getAttribute("cx")));
  expect(
    screen.getByRole("list", { name: "Chart request details" }).textContent,
  ).toMatch(/Request #7 · Above.*Request #8 · Below/);
});

it("keeps the same SVG and live oracle updates past request expiry without extending the target", () => {
  const { rerender } = render(
    <RfqhubPriceChart prices={prices} requests={[request]} />,
  );
  const svg = screen.getByRole("img", { name: /Live BTC price/ });
  const path = screen.getByTestId("oracle-path").getAttribute("d");
  const next = [
    ...prices,
    { id: 3, timestamp: Date.parse("2026-10-15T12:06:00Z"), price: 65002 },
  ];
  rerender(<RfqhubPriceChart prices={next} requests={[request]} />);
  expect(screen.getByRole("img", { name: /Live BTC price/ })).toBe(svg);
  expect(screen.getByTestId("oracle-path").getAttribute("d")).not.toBe(path);
  expect(
    Number(screen.getByTestId("position-end").getAttribute("cx")),
  ).toBeLessThan(Number(screen.getByTestId("oracle-end").getAttribute("cx")));
});

it("rejects malformed targets/times and other outcomes, deduplicates updates, and handles empty/flat data", () => {
  const invalid = [
    { priceTarget: "NaN" },
    { priceTarget: "0" },
    { priceTarget: "-1" },
    { priceTarget: "9".repeat(400) },
    { createdBy: "bad" },
    { expiry: request.createdBy },
    { expiry: "bad" },
    { outcome: "EthereumPrice" },
  ];
  expect(
    rfqhubChartPositions(invalid.map((p) => ({ ...request, ...p }))),
  ).toEqual([]);
  expect(
    rfqhubChartPositions([request, { ...request, priceTarget: "66000000000" }]),
  ).toHaveLength(1);
  const positions = rfqhubChartPositions([request]);
  const geometry = rfqhubChartGeometry(
    [{ ...prices[0], price: NaN }],
    positions,
  );
  expect(geometry.data).toEqual([]);
  expect(Number.isFinite(geometry.y(positions[0].target))).toBe(true);
  render(<RfqhubPriceChart prices={[]} requests={[request]} />);
  expect(screen.getByText("Waiting for live BTC prices")).not.toBeNull();
  expect(screen.getAllByTestId("position-segment")).toHaveLength(1);
});

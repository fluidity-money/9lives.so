import { render, screen } from "@testing-library/react";
import RfqhubPriceChart from "@/components/rfqhub/rfqhubPriceChart";
import { rfqhubChartPositions, rfqhubOpenPositions } from "@/lib/rfqhubChart";
import type { RfqhubIncomingRequest } from "@/lib/rfqhubRequests";

jest.mock("../src/config", () => ({
  __esModule: true,
  default: { simpleMarkets: { btc: { decimals: 2 } } },
}));
jest.mock("liveline", () => ({
  Liveline: (props: {
    data: unknown[];
    window: number;
    referenceLines?: { value: number; label: string; color: string }[];
  }) => (
    <output
      data-testid="liveline"
      data-count={props.data.length}
      data-window={props.window}
      data-reference={JSON.stringify(props.referenceLines ?? [])}
    />
  ),
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

const lines = () =>
  JSON.parse(screen.getByTestId("liveline").getAttribute("data-reference")!);

it("draws every open request as its own colored line, soonest expiry first", () => {
  const requests = [
    request,
    {
      ...request,
      id: "8",
      isUp: false,
      priceTarget: "65000800000",
      expiry: "2026-10-15T12:03:00Z",
    },
    { ...request, id: "9", createdBy: "2026-10-15T12:02:00Z" },
  ];
  const positions = rfqhubChartPositions(requests);
  const ids = (now: string) =>
    rfqhubOpenPositions(positions, Date.parse(now)).map((p) => p.id);
  expect(ids(request.deadline)).toEqual(["8", "7"]);
  expect(ids("2026-10-15T12:02:30Z")).toEqual(["8", "7", "9"]);
  expect(ids("2026-10-15T12:04:00Z")).toEqual(["7", "9"]);
  expect(ids(request.expiry)).toEqual([]);
  render(<RfqhubPriceChart prices={prices} requests={requests} />);
  expect(lines()).toHaveLength(2);
  expect(lines()[0]).toMatchObject({ value: 65000.8, color: "#a855f7" });
  expect(lines()[0].label).toMatch(/^#8 ↓ \$65,000\.80 until /);
  expect(lines()[1]).toMatchObject({ value: 65000.123456, color: "#3b82f6" });
  expect(lines()[1].label).toMatch(/^#7 ↑ \$65,000\.12 until /);
});

it("drops a request's line once the live price passes its expiry", () => {
  const { rerender } = render(
    <RfqhubPriceChart prices={prices} requests={[request]} />,
  );
  expect(lines()).toHaveLength(1);
  const next = [
    ...prices,
    { id: 3, timestamp: Date.parse("2026-10-15T12:06:00Z"), price: 65002 },
  ];
  rerender(<RfqhubPriceChart prices={next} requests={[request]} />);
  expect(lines()).toEqual([]);
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
  render(<RfqhubPriceChart prices={[]} requests={[request]} />);
  expect(screen.getByText("Waiting for live BTC prices")).not.toBeNull();
  expect(lines()).toEqual([]);
});

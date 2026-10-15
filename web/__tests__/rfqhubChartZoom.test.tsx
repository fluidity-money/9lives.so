import { fireEvent, render, screen } from "@testing-library/react";
import RfqhubPriceChart from "@/components/rfqhub/rfqhubPriceChart";
import {
  rfqhubClampWindow,
  rfqhubHistorySecs,
  rfqhubSortedPrices,
} from "@/lib/rfqhubChart";

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
const now = Date.parse("2026-10-15T12:15:00Z");
const prices = [
  { id: 1, timestamp: now - 1_200_000, price: 60000 },
  { id: 2, timestamp: now - 600_000, price: 64000 },
  { id: 3, timestamp: now - 120_000, price: 64990 },
  { id: 4, timestamp: now - 30_000, price: 65000 },
  { id: 5, timestamp: now, price: 65001 },
];
const chart = () => screen.getByTestId("liveline");
const windowSecs = () => Number(chart().getAttribute("data-window"));
const pressed = () =>
  screen
    .getAllByRole("button")
    .filter((b) => b.getAttribute("aria-pressed") === "true")
    .map((b) => b.textContent);
const select = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));
const wheel = (deltaY: number) =>
  fireEvent.wheel(screen.getByRole("img", { name: /Live BTC price/ }), {
    deltaY,
  });

it("sorts and drops bad samples, and sizes All to the history held", () => {
  const sorted = rfqhubSortedPrices([
    prices[1],
    { id: 9, timestamp: now, price: NaN },
    { id: 10, timestamp: NaN, price: 1 },
    { id: 11, timestamp: now, price: 0 },
    prices[0],
  ]);
  expect(sorted).toEqual([prices[0], prices[1]]);
  expect(rfqhubHistorySecs(prices)).toBe(1200);
  expect(rfqhubHistorySecs(prices.slice(-2))).toBe(900);
  expect(rfqhubHistorySecs([])).toBe(900);
  expect(rfqhubClampWindow(1, prices)).toBe(10);
  expect(rfqhubClampWindow(99_999, prices)).toBe(1200);
  expect(rfqhubClampWindow(120, prices)).toBe(120);
});

it("switches presets and keeps the selection and chart through new ticks", () => {
  const { rerender } = render(<RfqhubPriceChart prices={prices} />);
  const element = chart();
  expect(windowSecs()).toBe(60);
  expect(pressed()).toEqual(["1m"]);
  select("5m");
  expect(windowSecs()).toBe(300);
  select("15m");
  expect(windowSecs()).toBe(900);
  select("All");
  expect(windowSecs()).toBe(1200);
  select("5m");
  const next = [...prices, { id: 6, timestamp: now + 10_000, price: 65002 }];
  rerender(<RfqhubPriceChart prices={next} />);
  expect(pressed()).toEqual(["5m"]);
  expect(chart()).toBe(element);
  expect(chart().getAttribute("data-count")).toBe("6");
});

it("zooms with the wheel, clamps both ends, and resets on double click", () => {
  render(<RfqhubPriceChart prices={prices} />);
  wheel(100);
  expect(windowSecs()).toBeCloseTo(60 * Math.exp(0.2));
  expect(pressed()).toEqual([]);
  wheel(-200);
  expect(windowSecs()).toBeCloseTo(60 * Math.exp(-0.2));
  for (let i = 0; i < 20; i++) wheel(-500);
  expect(windowSecs()).toBe(10);
  for (let i = 0; i < 20; i++) wheel(500);
  expect(windowSecs()).toBe(1200);
  fireEvent.doubleClick(screen.getByRole("img", { name: /Live BTC price/ }));
  expect(windowSecs()).toBe(60);
  expect(pressed()).toEqual(["1m"]);
});

it("stops the page scrolling while zooming over the chart", () => {
  render(<RfqhubPriceChart prices={prices} />);
  const event = new WheelEvent("wheel", { deltaY: 100, cancelable: true });
  screen.getByRole("img", { name: /Live BTC price/ }).dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
});

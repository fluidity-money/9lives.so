import { act, renderHook } from "@testing-library/react";
import useRfqhubRequests from "@/hooks/useRfqhubRequests";
import {
  applyRfqhubMakerMatch,
  estimateRfqhubFloor,
  minimumRfqhubOffer,
  parseRfqhubMessage,
  parseRfqhubRequest,
} from "@/lib/rfqhubRequests";

jest.mock("../src/config", () => ({ __esModule: true, default: {} }));

const taker = {
  id: 7,
  acc_addr: "0x1234",
  asset: "BTC",
  amt: "10000000",
  min_offer: "8000000",
  created_by: "2026-10-14T12:00:00.500Z",
  decay_rate: 0.5,
  is_up: true,
  price_target: "65000000000",
  outcome: "BitcoinPrice",
  deadline: "2026-10-14T12:00:03.500Z",
  expiry: "2026-10-14T13:00:00Z",
  structure: { args: {}, sig: [] },
};
const maker = { acc_addr: "0x5678", amt: "5000000", bundle_taker_id: 7 };
const start = Date.parse(taker.created_by);

it("starts nullable minimums at the prediction amount and decays each second", () => {
  const request = parseRfqhubRequest({ ...taker, min_offer: null })!;
  expect(request.minOffer).toBeNull();
  expect(estimateRfqhubFloor(request, start)).toBe(BigInt(10000000));
  expect(estimateRfqhubFloor(request, start + 1000)).toBe(BigInt(5000000));
  expect(estimateRfqhubFloor(request, start + 2000)).toBe(BigInt(2500000));
});

it("preserves explicit zero as a zero floor", () => {
  for (const min_offer of ["0", 0]) {
    const request = parseRfqhubRequest({ ...taker, min_offer })!;
    expect(request.minOffer).toBe(min_offer === null ? null : "0");
    expect(estimateRfqhubFloor(request, start)).toBe(BigInt(0));
    expect(minimumRfqhubOffer(request, start)).toBe(BigInt(1));
  }
  expect(
    parseRfqhubRequest({ ...taker, min_offer: undefined }),
  ).toBeUndefined();
});

it.each([-1, 1.1, "0.5", null, undefined])(
  "rejects invalid decay rate %s",
  (decay_rate) => {
    expect(parseRfqhubRequest({ ...taker, decay_rate })).toBeUndefined();
  },
);

it("decays in whole seconds from creation, clamps to deadline, and handles endpoints", () => {
  const request = parseRfqhubRequest(taker)!;
  for (const [offset, floor] of [
    [-1000, 8000000],
    [999, 8000000],
    [1000, 4000000],
    [2999, 2000000],
    [3000, 1000000],
    [6000, 1000000],
  ]) {
    expect(estimateRfqhubFloor(request, start + offset!)).toBe(BigInt(floor!));
  }
  expect(estimateRfqhubFloor({ ...request, decayRate: 0 }, start + 6000)).toBe(
    BigInt(8000000),
  );
  expect(estimateRfqhubFloor({ ...request, decayRate: 1 }, start + 999)).toBe(
    BigInt(8000000),
  );
  expect(minimumRfqhubOffer({ ...request, decayRate: 1 }, start + 1000)).toBe(
    BigInt(1),
  );
  expect(minimumRfqhubOffer({ ...request, minOffer: "3" }, start + 1000)).toBe(
    BigInt(2),
  );
});

it("parses both snapshots and keeps maker quotes separate from the decay anchor", () => {
  const requests = parseRfqhubMessage(
    JSON.stringify({ BundleTakers: [taker, {}] }),
  );
  const makers = parseRfqhubMessage(
    JSON.stringify({ BundleMakers: [maker, {}] }),
  );
  if (requests?.type !== "takers" || makers?.type !== "makers")
    throw new Error("Missing snapshot");
  expect(requests.requests).toHaveLength(1);
  expect(makers.matches).toHaveLength(1);
  const [updated] = makers.matches.reduce(
    applyRfqhubMakerMatch,
    requests.requests,
  );
  expect(updated).toMatchObject({
    minOffer: "8000000",
    createdBy: taker.created_by,
    decayRate: 0.5,
    makerOffer: "5000000",
    matchVersion: 1,
  });
  expect(minimumRfqhubOffer(updated!, start)).toBe(BigInt(8000001));
  expect(minimumRfqhubOffer(updated!, start + 1000)).toBe(BigInt(5100000));
});

it("merges initial takers and makers in the hook and removes rows at the deadline", () => {
  jest.useFakeTimers().setSystemTime(start);
  const original = global.WebSocket;
  const socket: {
    onmessage?: (event: { data: string }) => void;
    close: () => void;
  } = { close: jest.fn() };
  global.WebSocket = jest.fn(() => socket) as unknown as typeof WebSocket;
  try {
    const { result, unmount } = renderHook(() => useRfqhubRequests());
    act(() =>
      socket.onmessage?.({ data: JSON.stringify({ BundleTakers: [taker] }) }),
    );
    act(() =>
      socket.onmessage?.({ data: JSON.stringify({ BundleMakers: [maker] }) }),
    );
    expect(result.current.requests[0]).toMatchObject({
      id: "7",
      makerOffer: "5000000",
      minOffer: "8000000",
    });
    act(() => jest.advanceTimersByTime(3001));
    expect(result.current.requests).toEqual([]);
    unmount();
  } finally {
    global.WebSocket = original;
    jest.useRealTimers();
  }
});

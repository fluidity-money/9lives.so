import mergePricePoints from "@/utils/mergePricePoints";
import type { PricePoint } from "@/types";

const point = (id: number, timestamp: number, price = id): PricePoint => ({
  id,
  timestamp,
  price,
});

describe("mergePricePoints", () => {
  test("sorts an initial snapshot", () => {
    const merged = mergePricePoints(undefined, [
      point(3, 300),
      point(1, 100),
      point(2, 200),
    ]);
    expect(merged.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  test("appends an in-order live point without resorting", () => {
    const previous = [point(1, 100), point(2, 200)];
    const merged = mergePricePoints(previous, [point(3, 300)]);
    expect(merged.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  test("inserts an out-of-order live point at the right position", () => {
    const previous = [point(1, 100), point(3, 300)];
    const merged = mergePricePoints(previous, [point(2, 200)]);
    expect(merged.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  test("drops a duplicate delivery of the same row", () => {
    const previous = [point(1, 100), point(2, 200)];
    const merged = mergePricePoints(previous, [point(2, 200)]);
    expect(merged.map((p) => p.id)).toEqual([1, 2]);
  });

  test("merges a late snapshot without losing newer live points", () => {
    const live = [point(4, 400), point(5, 500)];
    const snapshot = [point(1, 100), point(2, 200), point(3, 300)];
    const merged = mergePricePoints(live, snapshot);
    expect(merged.map((p) => p.id)).toEqual([1, 2, 3, 4, 5]);
  });
});

"use client";

import config from "@/config";
import type { PricePoint } from "@/types";
import { Liveline } from "liveline";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { RfqhubIncomingRequest } from "@/lib/rfqhubRequests";
import {
  RFQHUB_CHART_RANGES,
  RFQHUB_RANGE_SECS,
  type RfqhubChartRange,
  rfqhubClampWindow,
  rfqhubHistorySecs,
  rfqhubOpenPositions,
  rfqhubChartPositions,
  rfqhubSortedPrices,
} from "@/lib/rfqhubChart";

const decimals = config.simpleMarkets.btc.decimals;
const money = (price: number) =>
  `$${price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
const clock = (secs: number) =>
  new Date(secs * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function RfqhubPriceChart({
  prices,
  requests = [],
}: {
  prices: PricePoint[];
  requests?: RfqhubIncomingRequest[];
}) {
  // A preset, or null once the user has zoomed to a custom width.
  const [range, setRange] = useState<RfqhubChartRange | null>("1m");
  const [customSecs, setCustomSecs] = useState(60);
  const sorted = useMemo(() => rfqhubSortedPrices(prices), [prices]);
  const data = useMemo(
    () => sorted.map((p) => ({ time: p.timestamp / 1000, value: p.price })),
    [sorted],
  );
  const latest = sorted.at(-1);
  const windowSecs =
    range === "All"
      ? rfqhubHistorySecs(sorted)
      : range
        ? RFQHUB_RANGE_SECS[range]
        : customSecs;
  const positions = useMemo(() => rfqhubChartPositions(requests), [requests]);
  const targets = useMemo(
    () =>
      rfqhubOpenPositions(positions, sorted.at(-1)?.timestamp ?? 0).map(
        (p) => ({
          value: p.target,
          color: p.isUp ? "#3b82f6" : "#a855f7",
          label: `#${p.id} ${p.isUp ? "↑" : "↓"} ${money(p.target)} until ${clock(p.end / 1000)}`,
        }),
      ),
    [positions, sorted],
  );

  // Wheel and pinch zoom. Kept in refs so the listeners attach once.
  const wrapRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef({ windowSecs, sorted });
  useEffect(() => {
    zoomRef.current = { windowSecs, sorted };
  }, [windowSecs, sorted]);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const zoom = (factor: number) => {
      const { windowSecs, sorted } = zoomRef.current;
      const next = rfqhubClampWindow(windowSecs * factor, sorted);
      if (Math.abs(next - windowSecs) < 0.5) return;
      zoomRef.current.windowSecs = next;
      setCustomSecs(next);
      setRange(null);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoom(Math.exp(delta * 0.002));
    };
    const touches = new Map<number, { x: number; y: number }>();
    const distance = () => {
      const [a, b] = [...touches.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") touches.set(e.pointerId, e);
    };
    const onMove = (e: PointerEvent) => {
      if (!touches.has(e.pointerId) || touches.size !== 2) return;
      const before = distance();
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const after = distance();
      if (before > 0 && after > 0) zoom(before / after);
    };
    const onUp = (e: PointerEvent) => touches.delete(e.pointerId);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className="min-w-0">
      <div
        role="group"
        aria-label="Chart time range"
        className="flex justify-end gap-1"
      >
        {RFQHUB_CHART_RANGES.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={range === value}
            onClick={() => setRange(value)}
            className={`rounded px-3 py-1 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${range === value ? "bg-neutral-200 text-neutral-900" : "text-neutral-600 hover:bg-neutral-100"}`}
          >
            {value}
          </button>
        ))}
      </div>
      <div
        ref={wrapRef}
        role="img"
        aria-label={`Live BTC price${latest ? ` ${money(latest.price)}` : ""}. Scroll or pinch to zoom.`}
        className="h-[290px] touch-pan-y"
        onDoubleClick={() => setRange("1m")}
      >
        <Liveline
          data={data}
          value={latest?.price ?? 0}
          loading={!latest}
          emptyText="Waiting for live BTC prices"
          theme="dark"
          color="#16a34a"
          window={windowSecs}
          fill
          grid
          scrub
          referenceLines={targets}
          formatValue={money}
          formatTime={clock}
        />
      </div>
      {!latest && (
        <p className="text-xs text-neutral-600">Waiting for live BTC prices</p>
      )}
    </div>
  );
}

export default memo(RfqhubPriceChart);

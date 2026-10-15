"use client";

import config from "@/config";
import type { PricePoint, SimpleMarketKey } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const PRICE_TABLE = "oracles_ninelives_prices_2";
// Match the server's bounded snapshot history, without market-time cutoffs.
const MAX_POINTS = 4000;
const EMPTY_PRICES: PricePoint[] = [];

function parsePoint(
  row: unknown,
  asset: SimpleMarketKey,
): PricePoint | undefined {
  if (!row || typeof row !== "object") return;
  const value = row as Record<string, unknown>;
  if (
    value.base !== asset.toUpperCase() ||
    typeof value.created_by !== "string"
  )
    return;
  const timestamp = Date.parse(value.created_by);
  if (
    !Number.isFinite(timestamp) ||
    !Number.isSafeInteger(value.id) ||
    typeof value.amount !== "number" ||
    !Number.isFinite(value.amount) ||
    value.amount <= 0
  )
    return;
  return { id: value.id as number, price: value.amount, timestamp };
}

export default function useAssetPrices(asset: SimpleMarketKey) {
  const client = useQueryClient();
  const [connected, setConnected] = useState(false);
  const { data: prices = EMPTY_PRICES } = useQuery<PricePoint[]>({
    queryKey: ["liveAssetPrices", asset],
    queryFn: () => EMPTY_PRICES,
    enabled: false,
  });

  useEffect(() => {
    let stopped = false;
    let socket: WebSocket;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const connect = () => {
      if (stopped) return;
      socket = new WebSocket(config.NEXT_PUBLIC_WS_URL);
      socket.onopen = () => {
        if (stopped) return;
        attempts = 0;
        const subscription = {
          table: PRICE_TABLE,
          fields: [
            { name: "base", filter_constraints: { et: asset.toUpperCase() } },
          ],
        };
        socket.send(
          JSON.stringify({
            ask_for_snapshot: [subscription],
            add: [subscription],
          }),
        );
      };
      socket.onmessage = (event: MessageEvent<string>) => {
        if (stopped) return;
        try {
          const message = JSON.parse(event.data);
          if (!message || typeof message !== "object") return;
          const rows: unknown[] =
            message.table === PRICE_TABLE ? [message.content] : [];
          if (Array.isArray(message.snapshot_toplevel)) {
            for (const snapshot of message.snapshot_toplevel) {
              if (
                snapshot?.table === PRICE_TABLE &&
                Array.isArray(snapshot.snapshot)
              )
                rows.push(...snapshot.snapshot);
            }
          }
          const incoming = rows
            .map((row) => parsePoint(row, asset))
            .filter((point): point is PricePoint => !!point);
          if (!incoming.length) return;
          // Cached history can still be drawn during a reconnect, but wait
          // for this connection to deliver prices before enabling predictions.
          setConnected(true);
          client.setQueryData<PricePoint[]>(
            ["liveAssetPrices", asset],
            (previous = []) => {
              // Snapshot/live delivery can overlap or arrive out of order.
              const points = new Map(
                previous.map((point) => [point.id, point]),
              );
              for (const point of incoming) points.set(point.id, point);
              return [...points.values()]
                .sort((a, b) => a.timestamp - b.timestamp || a.id - b.id)
                .slice(-MAX_POINTS);
            },
          );
        } catch {
          // Ignore malformed frames without interrupting the live subscription.
        }
      };
      socket.onclose = () => {
        if (stopped) return;
        setConnected(false);
        retry = setTimeout(connect, Math.min(1000 * 2 ** attempts++, 30000));
      };
      socket.onerror = () => socket.close();
    };
    setConnected(false);
    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, [asset, client]);

  return { prices, connected };
}

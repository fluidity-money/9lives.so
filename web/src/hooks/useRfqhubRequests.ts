"use client";

import config from "@/config";
import {
  applyRfqhubMakerMatch,
  filterActiveRfqhubRequests,
  parseRfqhubMessage,
  resolveRfqhubWebsocketUrl,
  type RfqhubIncomingRequest,
} from "@/lib/rfqhubRequests";
import { useEffect, useState } from "react";

const MAX_REQUESTS = 50;
const MAX_TIMEOUT_MS = 2_147_000_000;

export type RfqhubConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected";

const mergeRequests = (
  current: RfqhubIncomingRequest[],
  incoming: RfqhubIncomingRequest[],
) => {
  const byId = new Map(
    filterActiveRfqhubRequests(current).map((request) => [request.id, request]),
  );
  for (const request of filterActiveRfqhubRequests(incoming)) {
    byId.set(request.id, request);
  }
  return [...byId.values()]
    .sort((left, right) => {
      const leftId = BigInt(left.id);
      const rightId = BigInt(right.id);
      return rightId > leftId ? 1 : rightId < leftId ? -1 : 0;
    })
    .slice(0, MAX_REQUESTS);
};

export default function useRfqhubRequests() {
  const [requests, setRequests] = useState<RfqhubIncomingRequest[]>([]);
  // Keep observed geometry after bidding closes. This is not a filled-position
  // ledger: reconnect snapshots may omit closed requests, and old local orders
  // do not contain authoritative targets or creation times.
  const [chartRequests, setChartRequests] = useState<RfqhubIncomingRequest[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<RfqhubConnectionStatus>("connecting");

  useEffect(() => {
    let socket: WebSocket | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectAttempts = 0;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      setConnectionStatus("connecting");
      socket = new WebSocket(
        resolveRfqhubWebsocketUrl(config.NEXT_PUBLIC_RFQHUB_WS_URL),
      );
      socket.onopen = () => {
        reconnectAttempts = 0;
        setConnectionStatus("connected");
      };
      socket.onmessage = (event: MessageEvent<string>) => {
        const message = parseRfqhubMessage(event.data);
        if (message?.type === "snapshot" || message?.type === "takers" || message?.type === "taker") {
          const incoming = message.type === "taker" ? [message.request] : message.requests;
          setChartRequests(current => {
            const byId = new Map(current.map(request => [request.id, request]));
            for (const request of incoming) byId.set(request.id, request);
            return [...byId.values()]
              .sort((a, b) => Date.parse(b.createdBy) - Date.parse(a.createdBy))
              .slice(0, MAX_REQUESTS);
          });
        }
        if (message?.type === "snapshot") {
          // Snapshots replace stale reconnect state, with maker quotes applied atomically.
          setRequests(
            message.matches.reduce(
              applyRfqhubMakerMatch,
              mergeRequests([], message.requests),
            ),
          );
        } else if (message?.type === "taker" || message?.type === "takers") {
          const incoming =
            message.type === "taker" ? [message.request] : message.requests;
          setRequests((current) => mergeRequests(current, incoming));
        } else if (message?.type === "maker" || message?.type === "makers") {
          const matches =
            message.type === "maker" ? [message.match] : message.matches;
          setRequests((current) =>
            matches.reduce(
              applyRfqhubMakerMatch,
              filterActiveRfqhubRequests(current),
            ),
          );
        }
      };
      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        if (destroyed) return;
        setConnectionStatus("disconnected");
        const delay = Math.min(1_000 * 2 ** reconnectAttempts, 30_000);
        reconnectAttempts += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  useEffect(() => {
    if (!requests.length) return;

    const nowMs = Date.now();
    const nextDeadlineMs = Math.min(
      ...requests.map((request) => Date.parse(request.deadline)),
    );
    const timer = setTimeout(
      () => {
        setRequests((current) => filterActiveRfqhubRequests(current));
      },
      Math.min(MAX_TIMEOUT_MS, Math.max(0, nextDeadlineMs - nowMs) + 1),
    );

    return () => clearTimeout(timer);
  }, [requests]);

  return { requests, connectionStatus };
}

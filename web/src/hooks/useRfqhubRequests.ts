"use client";

import config from "@/config";
import {
  parseRfqhubRequestMessage,
  RFQHUB_REQUESTS_TABLE,
  type RfqhubIncomingRequest,
} from "@/lib/rfqhubRequests";
import { useEffect, useState } from "react";

const MAX_REQUESTS = 50;

export type RfqhubConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected";

const websocketUrl = () => {
  if (config.NEXT_PUBLIC_RFQHUB_WS_URL) {
    return config.NEXT_PUBLIC_RFQHUB_WS_URL;
  }
  const url = new URL(config.NEXT_PUBLIC_RFQHUB_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString();
};

const mergeRequests = (
  current: RfqhubIncomingRequest[],
  incoming: RfqhubIncomingRequest[],
) => {
  const byId = new Map(current.map((request) => [request.id, request]));
  for (const request of incoming) byId.set(request.id, request);
  return [...byId.values()]
    .sort((left, right) => {
      const timeDifference =
        Date.parse(right.createdAt ?? "") - Date.parse(left.createdAt ?? "");
      if (Number.isFinite(timeDifference) && timeDifference !== 0) {
        return timeDifference;
      }
      return Number(right.id) - Number(left.id);
    })
    .slice(0, MAX_REQUESTS);
};

export default function useRfqhubRequests() {
  const [requests, setRequests] = useState<RfqhubIncomingRequest[]>([]);
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
      socket = new WebSocket(websocketUrl());
      socket.onopen = () => {
        reconnectAttempts = 0;
        setConnectionStatus("connected");
        socket?.send(
          JSON.stringify({
            add: [{ table: RFQHUB_REQUESTS_TABLE, fields: [] }],
            ask_for_snapshot: [{ table: RFQHUB_REQUESTS_TABLE, fields: [] }],
          }),
        );
      };
      socket.onmessage = (event: MessageEvent<string>) => {
        const incoming = parseRfqhubRequestMessage(event.data);
        if (incoming.length) {
          setRequests((current) => mergeRequests(current, incoming));
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

  return { requests, connectionStatus };
}

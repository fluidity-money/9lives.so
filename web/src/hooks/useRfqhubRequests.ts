"use client";

import config from "@/config";
import {
  parseRfqhubRequestMessage,
  resolveRfqhubWebsocketUrl,
  type RfqhubIncomingRequest,
} from "@/lib/rfqhubRequests";
import { useEffect, useState } from "react";

const MAX_REQUESTS = 50;

export type RfqhubConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected";

const mergeRequests = (
  current: RfqhubIncomingRequest[],
  incoming: RfqhubIncomingRequest[],
) => {
  const byId = new Map(current.map((request) => [request.id, request]));
  for (const request of incoming) byId.set(request.id, request);
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

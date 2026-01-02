"use client";

import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useRef, useSyncExternalStore } from "react";
import { PricePoint, RawPricePoint, SimpleMarketKey } from "@/types";
import config from "@/config";
type WSMessage = {
  table: "oracles_ninelives_prices_2";
  content: RawPricePoint & { base: string };
};

export function useWSForPrices({
  asset,
  starting,
  ending,
}: {
  asset: SimpleMarketKey;
  starting: number;
  ending: number;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<() => void>>(new Set());
  const lastMessageRef = useRef<WSMessage | null>(null);

  function initWebSocket({
    queryClient,
    asset,
    starting,
    ending,
  }: {
    queryClient: QueryClient;
    asset: SimpleMarketKey;
    starting: number;
    ending: number;
  }) {
    if (wsRef.current) return;

    const initialWs = new WebSocket("wss://websocket.9lives.so");
    wsRef.current = initialWs;

    initialWs.onopen = () => {
      console.log(`${asset} websocket is opened.`);
      initialWs.send(
        JSON.stringify({
          table: "oracles_ninelives_prices_2",
        }),
      );
    };

    initialWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage;
        lastMessageRef.current = msg;
        listenersRef.current.forEach((l) => l());

        if (
          msg.content.base === asset.toUpperCase() &&
          new Date(msg.content.created_by).getTime() > starting &&
          ending >= new Date(msg.content.created_by).getTime()
        ) {
          const newPoint = {
            price: Number(
              msg.content.amount.toFixed(config.simpleMarkets[asset].decimals),
            ),
            id: msg.content.id,
            timestamp: new Date(msg.content.created_by).getTime(),
          } as PricePoint;

          queryClient.setQueryData<
            { pages: PricePoint[][]; pageParams: number[] } | undefined
          >(["assetPrices", asset, starting, ending], (previousData) => {
            if (previousData) {
              if (
                previousData.pages[previousData.pages.length - 1].length ===
                config.hasuraMaxQueryItem
              ) {
                return {
                  pages: [...previousData.pages, [newPoint]],
                  pageParams: [
                    ...previousData.pageParams,
                    previousData.pageParams[
                      previousData.pageParams.length - 1
                    ] + 1,
                  ],
                };
              } else {
                return {
                  pages: previousData.pages.map((p, idx) => {
                    if (idx === previousData.pages.length - 1) {
                      return [...p, newPoint];
                    } else return p;
                  }),
                  pageParams: previousData.pageParams,
                };
              }
            } else {
              return { pages: [[newPoint]], pageParams: [0] };
            }
          });
        }
      } catch (e) {
        console.error("invalid ws payload", e);
      }
    };

    initialWs.onerror = (err) => {
      console.error("ws error", err);
    };

    initialWs.onclose = () => {
      console.log(`${asset} websocket is closed.`);
      wsRef.current = null;
    };
  }

  function subscribe({
    listener,
    queryClient,
    asset,
    starting,
    ending,
  }: {
    listener: () => void;
    queryClient: QueryClient;
    asset: SimpleMarketKey;
    starting: number;
    ending: number;
  }) {
    initWebSocket({ queryClient, asset, starting, ending });

    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  }

  function getSnapshot() {
    return lastMessageRef.current;
  }

  const queryClient = useQueryClient();

  return useSyncExternalStore(
    (l) => subscribe({ listener: l, queryClient, asset, starting, ending }),
    getSnapshot,
    () => null, // Get Server Snapshot
  );
}

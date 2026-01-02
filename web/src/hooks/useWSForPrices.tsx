"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
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
  const queryClient = useQueryClient();

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("wss://websocket.9lives.so");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`${asset} websocket is opened.`);
      ws.send(
        JSON.stringify({
          table: "oracles_ninelives_prices_2",
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage;

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
              const lastPageIdx = previousData.pages.length - 1;
              const lastPage = previousData.pages[lastPageIdx];

              if (lastPage.length === config.hasuraMaxQueryItem) {
                return {
                  pages: [...previousData.pages, [newPoint]],
                  pageParams: [
                    ...previousData.pageParams,
                    previousData.pageParams[lastPageIdx] + 1,
                  ],
                };
              } else {
                return {
                  pages: previousData.pages.map((p, idx) => {
                    if (idx === lastPageIdx) {
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

    ws.onerror = (err) => {
      // Ignore intentional closing errors
      if (
        ws.readyState === WebSocket.CLOSING ||
        ws.readyState === WebSocket.CLOSED
      )
        return;
      console.error("ws error", err);
    };

    ws.onclose = () => {
      console.log(`${asset} websocket is closed.`);
    };

    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [asset, starting, ending, queryClient]);
}

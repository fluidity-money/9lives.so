"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { PricePoint, RawPricePoint, SimpleMarketKey } from "@/types";
import config from "@/config";
import { useWebSocketStore } from "@/stores/websocket";

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
  const subscribe = useWebSocketStore((s) => s.subscribe);

  useEffect(() => {
    if (!queryClient) return;

    const offMessage = subscribe((raw) => {
      try {
        const msg = raw as WSMessage;

        if (
          msg.table !== "oracles_ninelives_prices_2" ||
          msg.content.base !== asset.toUpperCase()
        ) {
          return;
        }

        const ts = new Date(msg.content.created_by).getTime();

        if (ts <= starting || ts > ending) return;

        const newPoint: PricePoint = {
          price: Number(
            msg.content.amount.toFixed(config.simpleMarkets[asset].decimals),
          ),
          id: msg.content.id,
          timestamp: ts,
        };

        queryClient.setQueryData<
          { pages: PricePoint[][]; pageParams: number[] } | undefined
        >(["assetPrices", asset, starting, ending], (previousData) => {
          if (!previousData) {
            return { pages: [[newPoint]], pageParams: [0] };
          }

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
          }

          return {
            pages: previousData.pages.map((p, idx) =>
              idx === lastPageIdx ? [...p, newPoint] : p,
            ),
            pageParams: previousData.pageParams,
          };
        });
      } catch (e) {
        console.error("invalid ws payload", e);
      }
    });

    return () => {
      offMessage();
    };
  }, [asset, starting, ending, queryClient]);
}

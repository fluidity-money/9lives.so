"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { PricePoint, RawPricePoint, SimpleMarketKey } from "@/types";
import config from "@/config";

type WSMessage = {
  table: "oracles_ninelives_prices_2" | "";
  content: RawPricePoint & { base: string };
  snapshot_toplevel?: {
    table: "oracles_ninelives_prices_2";
    snapshot: (RawPricePoint & { base: string })[];
  }[];
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

  useEffect(() => {
    if (!queryClient) return;

    const ws = new WebSocket(config.NEXT_PUBLIC_WS_URL);

    ws.onopen = () => {
      console.log("WS opened", asset);
      ws.send(
        JSON.stringify({
          ask_for_snapshot: [
            {
              table: "oracles_ninelives_prices_2",
              fields: [
                {
                  name: "base",
                  filter_constraints: { et: asset.toUpperCase() },
                },
              ],
            },
          ],
        }),
      );

      ws.send(
        JSON.stringify({
          add: [
            {
              table: "oracles_ninelives_prices_2",
              fields: [
                {
                  name: "base",
                  filter_constraints: { et: asset.toUpperCase() },
                },
              ],
            },
          ],
        }),
      );
    };

    ws.onmessage = (raw: MessageEvent<string>) => {
      try {
        const msg: WSMessage = JSON.parse(raw.data);

        if (
          msg.snapshot_toplevel &&
          msg.snapshot_toplevel[0].table === "oracles_ninelives_prices_2"
        ) {
          queryClient.setQueryData<PricePoint[] | undefined>(
            ["assetPrices", asset, starting, ending],
            () =>
              msg
                .snapshot_toplevel![0].snapshot.filter((i) => {
                  const ts = new Date(i.created_by).getTime();
                  return ts >= starting && ending >= ts;
                })
                .map((i) => ({
                  price: Number(
                    i.amount.toFixed(config.simpleMarkets[asset].decimals),
                  ),
                  id: i.id,
                  timestamp: new Date(i.created_by).getTime(),
                }))
                .sort((a, b) => a.timestamp - b.timestamp),
          );
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

        queryClient.setQueryData<PricePoint[] | undefined>(
          ["assetPrices", asset, starting, ending],
          (previousData) => {
            if (!previousData) {
              return [newPoint];
            }

            return [...previousData, newPoint];
          },
        );
      } catch (e) {
        console.error("invalid ws payload", e);
      }
    };

    return () => {
      console.log("WS closed", asset);
      ws.close();
    };
  }, [asset, starting, ending, queryClient]);
}

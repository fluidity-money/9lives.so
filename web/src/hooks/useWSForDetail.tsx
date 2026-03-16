"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  CampaignMessage,
  PriceMessage,
  PricePoint,
  PriceSnapshot,
  SimpleCampaignDetail,
  SimpleMarketKey,
} from "@/types";
import config from "@/config";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";

type Message = PriceMessage | CampaignMessage | PriceSnapshot;
export function useWSForDetail({
  asset,
  starting,
  ending,
  previousData,
  simple = false,
}: {
  asset: SimpleMarketKey;
  starting: number;
  ending: number;
  previousData: SimpleCampaignDetail;
  simple: boolean;
}) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!queryClient) return;

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let campaignTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;

      ws = new WebSocket(config.NEXT_PUBLIC_WS_URL);

      ws.onopen = () => {
        reconnectAttempts = 0;

        ws!.send(
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
              { table: "ninelives_campaigns_1" },
              {
                table: "ninelives_buys_and_sells_1",
                fields: [
                  {
                    name: "emitter_addr",
                    filter_constraints: { et: previousData.poolAddress },
                  },
                ],
              },
            ],
          }),
        );
      };

      ws.onmessage = (raw: MessageEvent<string>) => {
        try {
          const msg: Message = JSON.parse(raw.data);

          if (
            msg.table === "" &&
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

          if (msg.table === "oracles_ninelives_prices_2") {
            const ts = new Date(msg.content.created_by).getTime();

            if (ts <= starting || ts > ending) return;

            const newPoint: PricePoint = {
              price: Number(
                msg.content.amount.toFixed(
                  config.simpleMarkets[asset].decimals,
                ),
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
            return;
          }

          if (
            msg.table === "ninelives_campaigns_1" &&
            simple &&
            msg.content.content.priceMetadata &&
            msg.content.content.priceMetadata.baseAsset.toLowerCase() ===
              asset &&
            msg.content.id !== previousData.identifier &&
            previousData.ending !== msg.content.content.ending * 1000
          ) {
            const content = msg.content.content;
            const identifier = msg.content.id as `0x${string}`;

            const nextData = formatSimpleCampaignDetail({
              ...content,
              identifier,
            });
            const prevPeriod = getPeriodOfCampaign(previousData);
            const nextPeriod = getPeriodOfCampaign(nextData);

            if (nextPeriod !== prevPeriod) {
              return;
            }

            const timeleft = content.starting * 1000 - Date.now();

            campaignTimer = setTimeout(
              () =>
                queryClient.setQueryData(
                  ["simpleCampaign", asset, nextPeriod],
                  nextData,
                ),
              timeleft,
            );

            return;
          }
        } catch (e) {
          console.error("invalid ws payload", e);
        }
      };

      ws.onclose = () => {
        if (destroyed) return;

        const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
        reconnectAttempts++;
        reconnectTimer = setTimeout(() => {
          if (!destroyed) connect();
        }, delay);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    return () => {
      destroyed = true;

      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (campaignTimer) clearTimeout(campaignTimer);

      ws?.close();
    };
  }, [asset, starting, ending, previousData, simple, queryClient]);
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  CampaignMessage,
  PriceMessage,
  PricePoint,
  PriceSnapshot,
  RawPricePoint,
  SimpleCampaignDetail,
  SimpleMarketKey,
} from "@/types";
import config from "@/config";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import mergePricePoints from "@/utils/mergePricePoints";

type Message = PriceMessage | CampaignMessage | PriceSnapshot;

const PRICES_TABLE = "oracles_ninelives_prices_2";

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
  // The campaign object is rewritten in the query cache on every trade;
  // read it through a ref so those updates don't tear down the socket.
  const previousDataRef = useRef(previousData);
  previousDataRef.current = previousData;
  const poolAddress = previousData.poolAddress;

  useEffect(() => {
    if (!queryClient) return;

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let campaignTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    const base = asset.toUpperCase();
    const toPoint = (i: RawPricePoint): PricePoint => ({
      price: Number(i.amount.toFixed(config.simpleMarkets[asset].decimals)),
      id: i.id,
      timestamp: new Date(i.created_by).getTime(),
    });

    const connect = () => {
      if (destroyed) return;

      ws = new WebSocket(config.NEXT_PUBLIC_WS_URL);

      ws.onopen = () => {
        reconnectAttempts = 0;

        ws!.send(
          JSON.stringify({
            ask_for_snapshot: [
              {
                table: PRICES_TABLE,
                fields: [
                  {
                    name: "base",
                    filter_constraints: { et: base },
                  },
                ],
              },
            ],
            add: [
              {
                table: PRICES_TABLE,
                fields: [
                  {
                    name: "base",
                    filter_constraints: { et: base },
                  },
                ],
              },
              { table: "ninelives_campaigns_1" },
              {
                table: "ninelives_buys_and_sells_1",
                fields: [
                  {
                    name: "emitter_addr",
                    filter_constraints: { et: poolAddress },
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

          if (msg.table === "") {
            const prices = msg.snapshot_toplevel?.find(
              (t) => t.table === PRICES_TABLE,
            );
            if (!prices) return;
            const points = prices.snapshot
              .filter((i) => {
                if (String(i.base).toUpperCase() !== base) return false;
                const ts = new Date(i.created_by).getTime();
                return ts >= starting && ending >= ts;
              })
              .map(toPoint);
            if (points.length === 0) return;
            queryClient.setQueryData<PricePoint[] | undefined>(
              ["assetPrices", asset, starting, ending],
              (previous) => mergePricePoints(previous, points),
            );
            return;
          }

          if (msg.table === PRICES_TABLE) {
            // The server only filters rows by base when its table
            // filtering feature is enabled, so drop other assets here.
            if (String(msg.content.base).toUpperCase() !== base) return;

            const ts = new Date(msg.content.created_by).getTime();
            if (ts <= starting || ts > ending) return;

            queryClient.setQueryData<PricePoint[] | undefined>(
              ["assetPrices", asset, starting, ending],
              (previous) => mergePricePoints(previous, [toPoint(msg.content)]),
            );
            return;
          }

          const campaignData = previousDataRef.current;
          if (
            msg.table === "ninelives_campaigns_1" &&
            simple &&
            msg.content.content.priceMetadata &&
            msg.content.content.priceMetadata.baseAsset.toLowerCase() ===
              asset &&
            msg.content.id !== campaignData.identifier &&
            campaignData.ending !== msg.content.content.ending * 1000
          ) {
            const content = msg.content.content;
            const identifier = msg.content.id as `0x${string}`;

            const nextData = formatSimpleCampaignDetail({
              ...content,
              identifier,
            });
            const prevPeriod = getPeriodOfCampaign(campaignData);
            const nextPeriod = getPeriodOfCampaign(nextData);

            if (nextPeriod !== prevPeriod) {
              return;
            }

            const timeleft = content.starting * 1000 - Date.now();

            if (campaignTimer) clearTimeout(campaignTimer);
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
  }, [asset, starting, ending, poolAddress, simple, queryClient]);
}

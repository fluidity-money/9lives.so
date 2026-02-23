"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  CampaignDetail,
  PricePoint,
  RawPricePoint,
  SimpleCampaignDetail,
  SimpleMarketKey,
  Trade,
} from "@/types";
import config from "@/config";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import formatFusdc from "@/utils/format/formatUsdc";

type Snapshot<TableName, Content> = {
  table: "";
  snapshot_toplevel?: {
    table: TableName;
    snapshot: Content[];
  }[];
  content: never;
};
type PriceSnapshot = Snapshot<
  "oracles_ninelives_prices_2",
  RawPricePoint & { base: string }
>;
type MessageBase<TableName, Content> = {
  table: TableName;
  content: Content;
};
type PriceMessage = MessageBase<
  "oracles_ninelives_prices_2",
  RawPricePoint & { base: string }
>;
type CampaignMessage = MessageBase<
  "ninelives_campaigns_1",
  {
    id: string;
    content: Omit<SimpleCampaignDetail, "identifier">;
  }
>;
type TradeMessage = MessageBase<
  "ninelives_buys_and_sells_1",
  {
    from_amount: string;
    outcome_id: string;
    emitter_addr: string;
    campaign_id: string;
    transaction_hash: string;
    created_by: string;
  }
>;
type Message = PriceMessage | CampaignMessage | PriceSnapshot | TradeMessage;
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

    const ws = new WebSocket(config.NEXT_PUBLIC_WS_URL);

    ws.onopen = () => {
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
          return;
        }

        if (
          msg.table === "ninelives_campaigns_1" &&
          simple &&
          msg.content.content.priceMetadata &&
          msg.content.content.priceMetadata.baseAsset.toLowerCase() === asset &&
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

          setTimeout(
            () =>
              queryClient.setQueryData(
                ["simpleCampaign", asset, nextPeriod],
                nextData,
              ),
            timeleft,
          );

          return;
        }

        if (msg.table === "ninelives_buys_and_sells_1") {
          queryClient.setQueryData<Trade[]>(
            ["campaignTrades", msg.content.campaign_id],
            (data) => {
              const newTrade = {
                amount: formatFusdc(msg.content.from_amount),
                txHash: msg.content.transaction_hash,
                outcomeId: `0x${msg.content.outcome_id}`,
                createdAt: msg.content.created_by,
              } as Trade;
              if (data) {
                if (data.length >= 4) {
                  const sliced = data.slice(0, 3);
                  return [newTrade, ...sliced];
                } else {
                  return [newTrade, ...data];
                }
              }
              return [newTrade];
            },
          );

          queryClient.setQueryData<CampaignDetail>(
            ["campaign", msg.content.campaign_id],
            (data) =>
              ({
                ...data,
                investmentAmounts: data?.investmentAmounts?.map((ia) =>
                  ia?.id === `0x${msg.content.outcome_id}`
                    ? {
                        ...ia,
                        usdc: ia.usdc + Number(msg.content.from_amount),
                      }
                    : ia,
                ),
                odds: data?.odds
                  ? {
                      ...data?.odds,
                      [msg.content.outcome_id]:
                        Number(data?.odds?.[msg.content.outcome_id] ?? 0) +
                        Number(msg.content.from_amount),
                    }
                  : undefined,
              }) as CampaignDetail,
          );

          const period = getPeriodOfCampaign(previousData);
          queryClient.setQueryData<SimpleCampaignDetail>(
            ["simpleCampaign", previousData.priceMetadata.baseAsset, period],
            (data) =>
              ({
                ...data,
                investmentAmounts: data?.investmentAmounts.map((ia) =>
                  ia?.id === `0x${msg.content.outcome_id}`
                    ? {
                        ...ia,
                        usdc: ia.usdc + Number(msg.content.from_amount),
                      }
                    : ia,
                ),
                odds: {
                  ...data?.odds,
                  [msg.content.outcome_id]:
                    Number(data?.odds?.[msg.content.outcome_id] ?? 0) +
                    Number(msg.content.from_amount),
                },
              }) as SimpleCampaignDetail,
          );
        }
      } catch (e) {
        console.error("invalid ws payload", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [asset, starting, ending, previousData, simple, queryClient]);
}

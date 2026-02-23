"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  CampaignDetail,
  SimpleCampaignDetail,
  SimpleMarketKey,
  Trade,
  TradeMessage,
} from "@/types";
import config from "@/config";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";
import formatFusdc from "@/utils/format/formatUsdc";
import { useAppKitAccount } from "@reown/appkit/react";

type Message = TradeMessage;
export function useWSForDetail({
  asset,
  starting,
  ending,
  previousData,
  simple = false,
  isDpm,
}: {
  asset: SimpleMarketKey;
  starting: number;
  ending: number;
  previousData: SimpleCampaignDetail;
  simple: boolean;
  isDpm: boolean;
}) {
  const queryClient = useQueryClient();
  const account = useAppKitAccount();
  useEffect(() => {
    if (!queryClient) return;

    const ws = new WebSocket(config.NEXT_PUBLIC_WS_URL);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          add: [
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

        if (msg.table === "ninelives_buys_and_sells_1") {
          // Update Live Trades
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

          // Update Campaign Detail
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

          // Update Simple Campaign Detail
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

          // Invalidate positions, reward estimations and position history
          if (account.address) {
            queryClient.invalidateQueries({
              queryKey: [
                "positions",
                previousData.poolAddress,
                previousData.outcomes,
                account.address,
                isDpm,
              ],
            });
            queryClient.invalidateQueries({
              queryKey: [
                "dppmShareEstimation",
                previousData.poolAddress,
                account.address,
                `0x${msg.content.outcome_id}`,
                true,
              ],
            });
            queryClient.invalidateQueries({
              queryKey: [
                "dppmShareEstimation",
                previousData.poolAddress,
                account.address,
                `0x${msg.content.outcome_id}`,
                false,
              ],
            });
            queryClient.invalidateQueries({
              queryKey: [
                "positionHistory",
                account.address,
                [`0x${msg.content.outcome_id}`],
              ],
            });
          }
        }
      } catch (e) {
        console.error("invalid ws payload", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [
    asset,
    starting,
    ending,
    previousData,
    simple,
    queryClient,
    account.address,
  ]);
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useContext } from "react";
import { Trade } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import { useWebSocketStore } from "@/stores/websocket";

type WSMessage = {
  table: "ninelives_buys_and_sells_1";
  content: {
    from_amount: string;
    outcome_id: string;
    emitter_addr: string;
    campaign_id: string;
    transaction_hash: string;
    created_by: string;
  };
};

export function useWSForTrades(id: string, poolAddress: string) {
  const queryClient = useQueryClient();
  const subscribe = useWebSocketStore((s) => s.subscribe);

  useEffect(() => {
    if (!queryClient) return;

    const offMessage = subscribe((raw) => {
      try {
        const msg = raw as WSMessage;

        if (
          msg.table !== "ninelives_buys_and_sells_1" ||
          msg.content.emitter_addr !== poolAddress
        ) {
          return;
        }

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
                const [_, ...rest] = data;
                return [newTrade, ...rest];
              } else {
                return [newTrade, ...data];
              }
            }
            return [newTrade];
          },
        );
      } catch (e) {
        console.error("invalid ws payload", e);
      }
    });

    return () => {
      offMessage();
    };
  }, [poolAddress, id, queryClient, subscribe]);
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useContext } from "react";
import { WSContext } from "@/providers/websocket9lives";
import { CampaignDetail } from "@/types";

type WSMessage = {
  table: "ninelives_market_odds_snapshot_1";
  content: {
    created_by: string;
    odds: Record<string, string>;
    pool_address: string;
  };
};

export function useWSForChances(id: string, poolAddress: string) {
  const queryClient = useQueryClient();
  const ws = useContext(WSContext);

  useEffect(() => {
    if (!ws) return;

    const offMessage = ws.subscribe((raw) => {
      try {
        const msg = raw as WSMessage;

        if (
          msg.table !== "ninelives_market_odds_snapshot_1" ||
          msg.content.pool_address !== poolAddress
        ) {
          return;
        }

        queryClient.setQueryData<CampaignDetail>(
          ["campaign", id],
          (data) =>
            ({
              ...data,
              investmentAmounts: data?.investmentAmounts.map((ia) =>
                ia && msg.content.odds[`0x${ia.id}`]
                  ? {
                      ...ia,
                      share: msg.content.odds[`0x${ia.id}`],
                      usdc: msg.content.odds[`0x${ia.id}`],
                    }
                  : ia,
              ),
            }) as CampaignDetail,
        );
      } catch (e) {
        console.error("invalid ws payload", e);
      }
    });

    return () => {
      offMessage();
    };
  }, [ws, poolAddress, id, queryClient]);
}

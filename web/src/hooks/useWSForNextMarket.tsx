"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useContext } from "react";
import { WSContext } from "@/providers/websocket9lives";
import { SimpleCampaignDetail } from "@/types";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";

type WSMessage = {
  table: "ninelives_campaigns_1";
  content: {
    id: string;
    content: Omit<SimpleCampaignDetail, "identifier">;
  };
};

export function useWSForNextMarket(
  previousData: SimpleCampaignDetail,
  simple: boolean = false,
) {
  const queryClient = useQueryClient();
  const ws = useContext(WSContext);
  const symbol = previousData.priceMetadata.baseAsset;
  const period = getPeriodOfCampaign(previousData);
  useEffect(() => {
    if (!ws || !simple) return;

    const offMessage = ws.subscribe((raw) => {
      try {
        const msg = raw as WSMessage;

        if (
          msg.table !== "ninelives_campaigns_1" ||
          msg.content.id === previousData.identifier ||
          previousData.ending === msg.content.content.ending * 1000 ||
          !msg.content.content.priceMetadata ||
          msg.content.content.priceMetadata.baseAsset.toLowerCase() !== symbol
        ) {
          return;
        }
        const content = msg.content.content;
        const identifier = msg.content.id as `0x${string}`;

        const nextData = formatSimpleCampaignDetail({
          ...content,
          identifier,
        });

        const msgPeriod = getPeriodOfCampaign(nextData);

        if (msgPeriod !== period) {
          return;
        }

        const timeleft = content.starting * 1000 - Date.now();

        setTimeout(
          () =>
            queryClient.setQueryData(
              ["simpleCampaign", symbol, period],
              nextData,
            ),
          timeleft,
        );
      } catch (e) {
        console.error("invalid ws payload", e);
      }
    });

    return () => {
      offMessage();
    };
  }, [
    ws,
    symbol,
    simple,
    previousData.identifier,
    previousData.ending,
    period,
    queryClient,
  ]);
}

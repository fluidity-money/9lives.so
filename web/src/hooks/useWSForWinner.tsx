"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useContext } from "react";
import { WSContext } from "@/providers/websocket9lives";
import { CampaignDetail } from "@/types";

type WSMessage = {
  table: "ninelives_events_outcome_decided";
  content: {
    created_by: string;
    transaction_hash: string;
    emitter_addr: string;
    identifier: string;
  };
};

export function useWSForWinner(id: string, poolAddress: string) {
  const queryClient = useQueryClient();
  const ws = useContext(WSContext);

  useEffect(() => {
    if (!ws) return;

    const offMessage = ws.subscribe((raw) => {
      try {
        const msg = raw as WSMessage;

        if (
          msg.table !== "ninelives_events_outcome_decided" ||
          msg.content.emitter_addr !== poolAddress
        ) {
          return;
        }

        queryClient.setQueryData<CampaignDetail>(
          ["campaign", id],
          (data) =>
            ({
              ...data,
              winner: `0x${msg.content.identifier}`,
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

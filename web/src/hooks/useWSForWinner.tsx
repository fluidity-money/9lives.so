"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { CampaignDetail, WinnerMessage } from "@/types";
import config from "@/config";

export function useWSForWinner(id: string, poolAddress: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!queryClient) return;

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;

      ws = new WebSocket(config.NEXT_PUBLIC_WS_URL);

      ws.onopen = () => {
        ws!.send(
          JSON.stringify({
            add: [
              {
                table: "ninelives_events_outcome_decided",
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
          const msg: WinnerMessage = JSON.parse(raw.data);

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

      ws?.close();
    };
  }, [poolAddress, id, queryClient]);
}

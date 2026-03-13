"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
// import { RewardMessage } from "@/types";
import config from "@/config";
import { useAppKitAccount } from "@reown/appkit/react";

export function useWSForRewards() {
  const queryClient = useQueryClient();
  const account = useAppKitAccount();
  useEffect(() => {
    if (!(queryClient && account.address)) return;

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
                table: "ninelives_payoff_unused_1",
                fields: [
                  {
                    name: "spender",
                    filter_constraints: { et: account.address!.toLowerCase() },
                  },
                ],
              },
            ],
          }),
        );
      };

      ws.onmessage = () => {
        try {
          // We dont need to read meessage, only invalidate endpoint to fetch up to date data

          queryClient.invalidateQueries({
            queryKey: ["unclaimedCampaigns", account.address, undefined],
          });
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
  }, [queryClient, account.address]);
}

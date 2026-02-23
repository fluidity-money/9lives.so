"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
// import { RewardMessage } from "@/types";
import config from "@/config";
import { useAppKitAccount } from "@reown/appkit/react";

export function useWSForWinner(poolAddress: string) {
  const queryClient = useQueryClient();
  const account = useAppKitAccount();
  useEffect(() => {
    if (!(queryClient && account.address)) return;

    const ws = new WebSocket(config.NEXT_PUBLIC_WS_URL);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          add: [
            {
              table: "ninelives_payoff_unused_1",
              fields: [
                {
                  name: "emitter_addr",
                  filter_constraints: { et: poolAddress },
                },
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

    return () => {
      ws.close();
    };
  }, [poolAddress, queryClient, account.address]);
}

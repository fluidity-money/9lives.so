import { useEffect } from "react";
import { createClient } from "graphql-ws";
import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import { Action, Campaign } from "@/types";
import { useDegenStore } from "@/stores/degenStore";
import { formatUnits } from "ethers";

export const wsClient = createClient({
  url: config.NEXT_PUBLIC_WS_URL,
  connectionParams: {},
});
const subTenLatestCreate = `
  subscription {
  ninelives_campaigns_1(limit: 10, order_by: {created_at: desc}){
    id
    created_at
    content
    updated_at
  }
}
`;
const subTenLatestBuy = `
subscription {
  ninelives_buys_and_sells_1(limit: 10, order_by: {created_by: desc}, where: {campaign_content: {_is_null: false}}) {
    to_amount
    to_symbol
    transaction_hash
    recipient
    spender
    block_hash
    block_number
    outcome_id
    campaign_id
    created_by
    emitter_addr
    from_amount
    from_symbol
    type
    total_volume
    campaign_content
  }
}
`;

export default function WebSocketProvider() {
  const queryClient = useQueryClient();
  const pushActions = useDegenStore((s) => s.pushActions);
  useEffect(() => {
    const unsubCreateEvents = wsClient.subscribe<{
      ninelives_campaigns_1: {
        id: string;
        created_at: string;
        content: Campaign;
        updated_at: string;
      }[];
    }>(
      { query: subTenLatestCreate },
      {
        next: ({ data }) => {
          const campaigns = data?.ninelives_campaigns_1;
          if (campaigns) {
            const actions: Action[] = campaigns.map((c) => ({
              id: c.id,
              campaignId: c.id,
              type: "create",
              campaignName: c.content.name,
              timestamp: c.created_at,
              campaignPic: c.content.picture,
            }));
            pushActions(actions);
          }
        },
        error: (error) => {
          console.error("WebSocket error for create:", error);
        },
        complete: () => {
          console.log("WebSocket create subscription closed.");
        },
      },
    );
    const unsubBuyAndSellEvents = wsClient.subscribe<{
      ninelives_buys_and_sells_1: {
        to_amount: number;
        to_symbol: string;
        transaction_hash: `0x${string}`;
        recipient: `0x${string}`;
        spender: `0x${string}`;
        block_hash: string;
        block_number: number;
        outcome_id: `0x${string}`;
        campaign_id: `0x${string}`;
        created_by: string;
        emitter_addr: `0x${string}`;
        from_amount: number;
        from_symbol: string;
        type: "buy" | "sell";
        total_volume: number;
        campaign_content: Campaign;
      }[];
    }>(
      { query: subTenLatestBuy },
      {
        next: async ({ data }) => {
          const events = data?.ninelives_buys_and_sells_1;
          if (events) {
            const actions: Action[] = events.map((event) => {
              return {
                id: event.transaction_hash,
                type: event.type,
                campaignId: event.campaign_id,
                campaignName: event.campaign_content.name,
                timestamp: event.created_by,
                campaignPic: event.campaign_content.picture,
                campaignVol: (event.total_volume / 1e6).toFixed(2),
                actionValue: (
                  (event.from_symbol === "FUSDC"
                    ? event.from_amount
                    : event.to_amount) / 1e6
                ).toFixed(2),
                outcomeName: event.campaign_content.outcomes.find(
                  (o) => o.identifier === event.outcome_id,
                )?.name,
              };
            });
            pushActions(actions);
          }
        },
        error: (error) => {
          console.error("WebSocket error for buy:", error);
        },
        complete: () => {
          console.log("WebSocket buy subscription closed.");
        },
      },
    );
    return () => {
      unsubCreateEvents();
      unsubBuyAndSellEvents();
    };
  }, [queryClient, pushActions]);

  return null;
}

import { useEffect } from "react";
import { createClient } from "graphql-ws";
import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import {
  Action,
  ActionFromBuysAndSells,
  ActionFromCreation,
  CreationResponse,
} from "@/types";
import { BuyAndSellResponse } from "../types";
import { mergeSortedActions } from "@/utils/mergeSortedActions";

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
  useEffect(() => {
    const unsubCreateEvents = wsClient.subscribe<CreationResponse>(
      { query: subTenLatestCreate },
      {
        next: ({ data }) => {
          const campaigns = data?.ninelives_campaigns_1;
          if (campaigns) {
            const newActions: Action[] = campaigns.map(
              (c) => new ActionFromCreation(c),
            );
            queryClient.setQueryData<Action[]>(["actions"], (data) =>
              mergeSortedActions(data ?? [], newActions),
            );
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
    const unsubBuyAndSellEvents = wsClient.subscribe<BuyAndSellResponse>(
      { query: subTenLatestBuy },
      {
        next: async ({ data }) => {
          const events = data?.ninelives_buys_and_sells_1;
          if (events) {
            const newActions: Action[] = events.map(
              (event) => new ActionFromBuysAndSells(event),
            );
            queryClient.setQueryData<Action[]>(["actions"], (data) =>
              mergeSortedActions(newActions, data ?? []),
            );
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
  }, [queryClient]);

  return null;
}

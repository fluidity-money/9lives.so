import { useEffect } from "react";
import { createClient } from "graphql-ws";
import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import {
  Action,
  CreationResponse,
  PaymasterAttempt,
  PaymasterAttemptResponse,
} from "@/types";
import { BuyAndSellResponse } from "../types";
import { mergeSortedActions } from "@/utils/mergeSortedActions";
import { usePaymasterStore } from "@/stores/paymasterStore";
import handleTicketAttempts from "@/utils/handleAttempts";
import {
  formatActionFromBuysAndSells,
  formatActionFromCreation,
} from "@/utils/format/formatActions";

export const wsClient = createClient({
  url: config.NEXT_PUBLIC_HASURA_URL,
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
  ninelives_buys_and_sells_1(limit: 10, order_by: {created_by: desc}, where: {campaign_content: {_is_null: false}, shown: {}}) {
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
const subTenLatestPaymasterAttempts = `
subscription($ticketIds: [Int!]!) {
  ninelives_paymaster_attempts_2(where: {poll_id: {_in: $ticketIds}}) {
    id
    created_by
    poll_id
    transaction_hash
    success
  }
}
`;
export default function WebSocketProvider() {
  const queryClient = useQueryClient();
  const tickets = usePaymasterStore((s) => s.tickets);
  const closeTicket = usePaymasterStore((s) => s.closeTicket);
  useEffect(() => {
    const unsubCreateEvents = wsClient.subscribe<CreationResponse>(
      { query: subTenLatestCreate },
      {
        next: ({ data }) => {
          const campaigns = data?.ninelives_campaigns_1;
          if (campaigns) {
            const newActions: Action[] = campaigns.map((c) =>
              formatActionFromCreation(c),
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
            const newActions: Action[] = events.map((event) =>
              formatActionFromBuysAndSells(event),
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

  useEffect(() => {
    if (tickets.length > 0) {
      const ticketIds = tickets.map((t) => Number(t.id));
      const unsubPaymasterEvents = wsClient.subscribe<PaymasterAttemptResponse>(
        {
          query: subTenLatestPaymasterAttempts,
          variables: { ticketIds },
        },
        {
          next: async ({ data }) => {
            const attempts = data?.ninelives_paymaster_attempts_2;
            if (!attempts) return;

            const grouped = new Map<number, PaymasterAttempt[]>();
            for (const attempt of attempts) {
              if (!grouped.has(attempt.poll_id)) {
                grouped.set(attempt.poll_id, []);
              }
              grouped.get(attempt.poll_id)!.push(attempt);
            }

            const filteredAttempts: PaymasterAttempt[] = [];

            for (const [, group] of grouped.entries()) {
              const successItem = group.find((a) => a.success);
              if (successItem) {
                filteredAttempts.push(successItem);
              } else {
                const failedAttempts = group.filter((a) => !a.success);
                if (failedAttempts.length >= 5) {
                  // Add one representative failed attempt
                  filteredAttempts.push(failedAttempts[0]);
                }
              }
            }
            filteredAttempts.forEach((attempt) => {
              const ticket = tickets.find((t) => attempt.poll_id === +t.id)!;
              handleTicketAttempts[ticket.opType](ticket, attempt, queryClient);
              closeTicket(attempt.poll_id.toString());
            });
          },
          error: (error) => {
            console.error("WebSocket error for paymaster:", error);
          },
          complete: () => {
            console.log("WebSocket paymaster subscription closed.");
          },
        },
      );
      return () => {
        unsubPaymasterEvents();
      };
    }
  }, [queryClient, tickets, closeTicket]);

  return null;
}

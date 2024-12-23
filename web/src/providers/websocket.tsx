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
  ninelives_events_shares_minted(limit: 10, order_by: {created_by: desc}) {
    fusdc_spent
    spender
    id
    identifier
    share_amount
    created_by
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
    const unsubBuyEvents = wsClient.subscribe<{
      ninelives_events_shares_minted: {
        id: number;
        identifier: string;
        fusdc_spent: number;
        share_amount: number;
        spender: string;
        created_by: string;
      }[];
    }>(
      { query: subTenLatestBuy },
      {
        next: async ({ data }) => {
          const buys = data?.ninelives_events_shares_minted;
          if (buys) {
            await queryClient.refetchQueries({ queryKey: ["campaigns"] });
            const campaigns = queryClient.getQueryData<Campaign[]>([
              "campaigns",
            ]);
            const actions: Action[] = buys.map((buy) => {
              const actionCampaign = campaigns?.find(
                (c) =>
                  !!c.outcomes.find(
                    (o) => o.identifier === `0x${buy.identifier.slice(0, 16)}`,
                  ),
              );
              return {
                id: buy.identifier + buy.id,
                type: "buy",
                campaignName: actionCampaign?.name || "Unknown campaign",
                timestamp: buy.created_by,
                campaignPic: actionCampaign?.picture || "",
                actionValue: "$" + formatUnits(buy.fusdc_spent, 6),
                outcomeName:
                  actionCampaign?.outcomes.find(
                    (o) => o.identifier === `0x${buy.identifier.slice(0, 16)}`,
                  )?.name || "Unknown outcome",
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
      unsubBuyEvents();
    };
  }, [queryClient]);

  return null;
}

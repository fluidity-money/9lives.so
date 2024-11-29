import { useEffect } from "react";
import { createClient } from "graphql-ws";
import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import { CampaignListQuery } from "@/gql/graphql";
import { Action } from "@/types";

export const wsClient = createClient({
  url: config.NEXT_PUBLIC_WS_URL,
  connectionParams: {},
});
const subTenLatestCreates = `
  subscription {
  ninelives_campaigns_1(limit: 10, order_by: {created_at: asc}){
    id
    created_at
    content
    updated_at
  }
}
`;

export default function WebSocketProvider() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsub = wsClient.subscribe<{
      id: string;
      created_at: string;
      content: CampaignListQuery;
      updated_at: string;
    }>(
      { query: subTenLatestCreates },
      {
        next: ({ data }) => {
          queryClient.setQueryData<Action[]>(["actions"], (oldData) => {
            const newAction = {
              id: data?.id,
              campaignName: data?.content?.campaigns[0]?.name,
              type: "create",
              campaignPic: data?.content?.campaigns[0]?.picture,
              timestamp: data?.created_at,
              campaignVol: undefined, // no direct data available
            } as Action;
            return !oldData ? [newAction] : [...oldData, newAction];
          });
        },
        error: (error) => {
          console.error("WebSocket error:", error);
        },
        complete: () => {
          console.log("WebSocket subscription closed.");
        },
      },
    );
    return () => {
      unsub();
    };
  }, [queryClient]);

  return null;
}

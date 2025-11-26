"use client";
import React, { useEffect } from "react";
import { createClient } from "graphql-ws";
import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import {
  CampaignDetail,
  SimpleCampaignDetail,
  SimpleMarketPeriod,
} from "@/types";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import getPeriodOfCampaign from "@/utils/getPeriodOfCampaign";

export const wsClient = createClient({
  url: config.NEXT_PUBLIC_WS_URL,
  connectionParams: {},
});

const query = `
subscription($symbol: String!,$period: String!) {
  ninelives_campaigns_1(
      where: {
        content:{ 
          _contains: {
            priceMetadata: {baseAsset: $symbol}
            categories: [$period]
          }
        }
      }, 
      order_by: {created_at: desc}, 
      limit: 1) {
    id
    created_at
    content
    updated_at
  }
}
`;
export default function ActiveCampaignProvider({
  previousData,
  children,
  simple,
}: {
  previousData: SimpleCampaignDetail;
  children: Readonly<React.ReactNode>;
  simple: boolean;
}) {
  const queryClient = useQueryClient();
  const symbol = previousData.priceMetadata.baseAsset;
  const period = getPeriodOfCampaign(previousData);
  useEffect(() => {
    const unsubPrices = wsClient.subscribe<{
      ninelives_campaigns_1: { content: SimpleCampaignDetail; id: string }[];
    }>(
      {
        query,
        variables: {
          symbol: symbol.toUpperCase(),
          period,
        },
      },
      {
        next: async ({ data }) => {
          const _data = data?.ninelives_campaigns_1[0].content;
          if (_data) {
            const nextData = formatSimpleCampaignDetail({
              ..._data,
              identifier: data?.ninelives_campaigns_1[0].id,
            });
            if (simple) {
              queryClient.setQueryData(
                ["simpleCampaign", symbol, period],
                nextData,
              );
            } else if (
              previousData.identifier === nextData.identifier &&
              nextData.winner
            ) {
              // only update to read resolved winner in real time
              queryClient.setQueryData(["campaign", previousData.identifier], {
                ...previousData,
                winner: nextData.winner,
              } as CampaignDetail);
            }
          }
        },
        error: (error) => {
          console.error("WebSocket error for campaign activity", symbol, error);
        },
        complete: () => {
          console.log(
            "WebSocket campaign activity subscription closed.",
            symbol,
          );
        },
      },
    );
    return () => {
      unsubPrices();
    };
  }, [queryClient, symbol, previousData, simple, period]);

  return children;
}

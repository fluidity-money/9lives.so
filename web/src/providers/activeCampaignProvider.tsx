"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "graphql-ws";
import config from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import { SimpleCampaignDetail } from "@/types";
import RetroCard from "@/components/cardRetro";
import Link from "next/link";
import Button from "@/components/themed/button";
import CountdownTimer from "@/components/countdownTimer";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";

export const wsClient = createClient({
  url: config.NEXT_PUBLIC_WS_URL,
  connectionParams: {},
});

const query = `
subscription($symbol: String!) {
  ninelives_campaigns_1(
      where: {
        content:{ 
          _contains: {
            priceMetadata: {baseAsset: $symbol}
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
  symbol,
  children,
}: {
  previousData: SimpleCampaignDetail;
  symbol: string;
  children: Readonly<React.ReactNode>;
}) {
  const queryClient = useQueryClient();
  const [liveCampaign, setLiveCampaign] = useState<SimpleCampaignDetail>();
  useEffect(() => {
    const unsubPrices = wsClient.subscribe<{
      ninelives_campaigns_1: { content: SimpleCampaignDetail; id: string }[];
    }>(
      {
        query,
        variables: {
          symbol: symbol.toUpperCase(),
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
            if (nextData.starting > previousData.starting) {
              setLiveCampaign(nextData);
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
  }, [queryClient, symbol, previousData.starting]);

  return (
    <>
      {children}
      {liveCampaign ? (
        <RetroCard
          title="🔴 Live Campaign 🔴"
          position="middle"
          className="flex flex-col items-center space-y-4"
          showClose={false}
        >
          <span className="font-chicago">New campaign is live!</span>
          <div className="font-chicago">
            <CountdownTimer endTime={liveCampaign.ending} />
          </div>
          <Link
            href={`/simple/campaign/${liveCampaign.priceMetadata.baseAsset}?cid=${liveCampaign.identifier}`}
          >
            <Button intent={"cta"}>Be the winner of the hour!</Button>
          </Link>
        </RetroCard>
      ) : null}
    </>
  );
}

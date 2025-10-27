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

export const wsClient = createClient({
  url: config.NEXT_PUBLIC_WS_URL,
  connectionParams: {},
});

const query = `
subscription($symbol: String!) {
  ninelives_campaigns_1(order_by: {created_at: desc}, where: {priceMetadata: {_eq: $symbol} }, limit: 1) {
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
  const _symbol = symbol.toLowerCase();
  const [liveCampaign, setLiveCampaign] = useState<SimpleCampaignDetail>();
  useEffect(() => {
    const unsubPrices = wsClient.subscribe<{
      ninelives_campaigns_1: { content: SimpleCampaignDetail }[];
    }>(
      {
        query,
        variables: {
          symbol: symbol.toUpperCase(),
        },
      },
      {
        next: async ({ data }) => {
          const nextData = data?.ninelives_campaigns_1[0].content;
          if (nextData && nextData.starting > previousData.starting) {
            setLiveCampaign(nextData);
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
  }, [queryClient, symbol]);

  return (
    <>
      {children}
      {liveCampaign ? (
        <div className="fixed bottom-4 right-4 md:bottom-8">
          <RetroCard
            title="🔴 Live Campaign 🔴"
            position="middle"
            className="flex flex-col space-y-4"
            showClose={false}
          >
            <Link
              href={`/simple/campaign/${liveCampaign.priceMetadata.baseAsset}?id=${liveCampaign.identifier}`}
              className="underlinve font-chicago text-xs"
            >
              New campaign is live!
            </Link>
            <CountdownTimer endTime={liveCampaign.ending} />
            <Button intent={"cta"}>Be the winner of the hour!</Button>
          </RetroCard>
        </div>
      ) : null}
    </>
  );
}

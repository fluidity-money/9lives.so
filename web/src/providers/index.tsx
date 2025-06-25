"use client";
import { ThirdwebProvider } from "thirdweb/react";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";
import { BuyAndSellResponse, Campaign, CreationResponse } from "@/types";
import PostHogProvider from "./postHog";
import WebSocketProvider from "./websocket";
import ReferralHandler from "./referralHandler";
import { Suspense } from "react";
import LiFiProvider from "./lifi";
import FarcasterProvider from "./farcaster";

export default function Providers({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: {
    campaigns: Campaign[];
    totalUserCount?: number;
    degenBuysAndSells: BuyAndSellResponse;
    degenCreations: CreationResponse;
    featuredCampaigns: Campaign[];
  };
}) {
  return (
    <ThirdwebProvider>
      <ReactQueryProvider initialData={initialData}>
        <ContextInjector />
        <WebSocketProvider />
        <FarcasterProvider />
        <Suspense>
          <ReferralHandler />
        </Suspense>
        <PostHogProvider>
          <LiFiProvider>{children}</LiFiProvider>
        </PostHogProvider>
      </ReactQueryProvider>
    </ThirdwebProvider>
  );
}

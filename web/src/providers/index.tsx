"use client";
import { ThirdwebProvider } from "thirdweb/react";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";
import { BuyAndSellResponse, Campaign, CreationResponse } from "@/types";
import PostHogProvider from "./postHog";
import WebSocketProvider from "./websocket";
import ReferralHandler from "./referralHandler";
import { Suspense } from "react";

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
  };
}) {
  return (
    <ThirdwebProvider>
      <ReactQueryProvider initialData={initialData}>
        <ContextInjector />
        <WebSocketProvider />
        <Suspense>
          <ReferralHandler />
        </Suspense>
        <PostHogProvider>{children}</PostHogProvider>
      </ReactQueryProvider>
    </ThirdwebProvider>
  );
}

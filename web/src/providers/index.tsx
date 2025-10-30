"use client";
import { ThirdwebProvider } from "thirdweb/react";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";
import PostHogProvider from "./postHog";
import WebSocketProvider from "./websocket";
import ReferralHandler from "./referralHandler";
import { Suspense } from "react";
import LiFiProvider from "./lifi";
import FarcasterProvider from "./farcaster";
import RelayProvider from "./relay";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <ReactQueryProvider>
        <ContextInjector />
        <WebSocketProvider />
        <FarcasterProvider />
        <RelayProvider />
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

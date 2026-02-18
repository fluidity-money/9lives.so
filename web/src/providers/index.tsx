"use client";
import WalletProvider from "./wallet";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";
import PostHogProvider from "./postHog";
import WebSocketProvider from "./websocket";
import ReferralHandler from "./referralHandler";
import { Suspense } from "react";
import FarcasterProvider from "./farcaster";
import RelayProvider from "./relay";
// import { WebSocketProvider as WS9Lives } from "./websocket9lives";
export default function Providers({
  children,
  cookies,
  version,
}: {
  children: React.ReactNode;
  cookies: string | null;
  version: "1" | "2";
}) {
  return (
    <WalletProvider cookies={cookies}>
      <ReactQueryProvider>
        <ContextInjector version={version} />
        <WebSocketProvider />
        <FarcasterProvider />
        <RelayProvider />
        <Suspense>
          <ReferralHandler />
        </Suspense>
        <PostHogProvider>
          {/* <WS9Lives> */}
          {children}
          {/* </WS9Lives> */}
        </PostHogProvider>
      </ReactQueryProvider>
    </WalletProvider>
  );
}

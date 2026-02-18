"use client";
import WalletProvider from "./wallet";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";
import PostHogProvider from "./postHog";
import ReferralHandler from "./referralHandler";
import { Suspense } from "react";
import FarcasterProvider from "./farcaster";
import RelayProvider from "./relay";
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
        <FarcasterProvider />
        <RelayProvider />
        <Suspense>
          <ReferralHandler />
        </Suspense>
        <PostHogProvider>{children}</PostHogProvider>
      </ReactQueryProvider>
    </WalletProvider>
  );
}

"use client";
import { ThirdwebProvider } from "thirdweb/react";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";
import { Campaign } from "@/types";
import PostHogProvider from "./postHog";
import WebSocketProvider from "./websocket";

export default function Providers({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: { campaigns: Campaign[]; totalUserCount: number };
}) {
  return (
    <ThirdwebProvider>
      <ReactQueryProvider initialData={initialData}>
        <ContextInjector />
        <WebSocketProvider />
        <PostHogProvider>{children}</PostHogProvider>
      </ReactQueryProvider>
    </ThirdwebProvider>
  );
}

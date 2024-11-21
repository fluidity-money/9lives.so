"use client";
import { ThirdwebProvider } from "thirdweb/react";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";
import { Campaign } from "@/types";
import PostHogProvider from "./postHog";

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
        <PostHogProvider>{children}</PostHogProvider>
      </ReactQueryProvider>
    </ThirdwebProvider>
  );
}

"use client";
import { ThirdwebProvider } from "thirdweb/react";
import ReactQueryProvider from "./reactQuery";
import ContextInjector from "./contextInjector";
import { Campaign } from "@/types";
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"

export default function Providers({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: { campaigns: Campaign[]; totalUserCount: number };
}) {
  if (typeof window !== "undefined") {
    posthog.init(`${process.env.NEXT_PUBLIC_POSTHOG_KEY}`, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
    })
  };
  return (
    <PostHogProvider client={posthog}>
      <ThirdwebProvider>
        <ReactQueryProvider initialData={initialData}>
          <ContextInjector />
          {children}
        </ReactQueryProvider>
      </ThirdwebProvider>
    </PostHogProvider>
  );
}

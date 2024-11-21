import posthog from "posthog-js";
import { PostHogProvider as PostHogProviderBase } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    posthog.init(`${process.env.NEXT_PUBLIC_POSTHOG_KEY}`, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
    });
  }, []);

  return <PostHogProviderBase client={posthog}>{children}</PostHogProviderBase>;
}

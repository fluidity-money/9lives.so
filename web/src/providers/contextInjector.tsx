"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import config from "@/config";
import { hitUser, tagUser } from "@fluidity-money/snitch-client";
import Bowser from "bowser";
import { useUserStore } from "@/stores/userStore";
import { grantedConsent } from "@/components/googleAnalytics";
import {
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
} from "@reown/appkit/react";

export default function ContextInjector({ version }: { version: "1" | "2" }) {
  const pathname = usePathname();

  const account = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletInfo } = useWalletInfo();

  const [tagSnitch, setTagSnitch] = useState<string>();
  const trackingConsent = useUserStore((s) => s.trackingConsent);
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  const farcasterCtx = useUserStore((s) => s.farcasterCtx);
  const setTrackingConsent = useUserStore((s) => s.setTrackingConsent);

  useEffect(() => {
    const consent = window.localStorage.getItem("consentMode");
    setTrackingConsent(consent === JSON.stringify(grantedConsent));
  }, [setTrackingConsent]);

  // insert contractAddresses to Posthog
  useEffect(() => {
    const { decimals, ...contracts } = config.contracts;
    const contractContexts = Object.fromEntries(
      Object.entries(contracts).map(([key, value]) => [key, value.address]),
    );
    posthog.register({ contracts: contractContexts });
  }, []);

  useEffect(() => {
    if (account?.address && trackingConsent) {
      // wallet address stored to local storage for GTM to use it
      window.localStorage.setItem(
        "walletAddress",
        account.address?.toLowerCase(),
      );
      posthog.identify(account.address?.toLowerCase());
      const ctx = {
        version,
        walletId: walletInfo?.name ?? "unknown",
        walletAddress: account.address.toLowerCase(),
        chainId,
        farcaster: isInMiniApp,
      } as any;
      if (farcasterCtx) {
        ctx.farcaster_fid = farcasterCtx.user?.fid;
        ctx.farcaster_username = farcasterCtx.user?.username;
      }
      posthog.register(ctx);
    } else {
      window.localStorage.removeItem("walletAddress");
      posthog.reset();
    }
  }, [
    trackingConsent,
    isInMiniApp,
    farcasterCtx,
    account?.address,
    chainId,
    walletInfo?.name,
  ]);

  // add margin for fixed action component on campaign details
  useEffect(() => {
    const footer = document.getElementsByTagName("footer")[0];
    if (footer && version === "1") {
      if (pathname.startsWith("/campaign/"))
        footer.classList.add("mint-box-margin");
      else footer.classList.remove("mint-box-margin");
    }
  }, [pathname]);

  useEffect(() => {
    if (trackingConsent && config.NEXT_PUBLIC_CHAIN !== "testnet") {
      const browser = Bowser.getParser(window.navigator.userAgent);
      const browserName = browser.getBrowserName();
      const os = browser.getOSName();
      const platform = browser.getPlatform();
      (async () => {
        try {
          const context = {
            address: account?.address?.toLowerCase(),
            property: "9lives",
            facts: [
              { key: "languages", value: [...navigator.languages] },
              { key: "browser", value: [browserName] },
              { key: "os", value: [os] },
              { key: "platform", value: [platform.type?.toString() ?? ""] },
              { key: "version", value: [version] },
              {
                key: "screenResolution",
                value: [`${screen.width}x${screen.height}`],
              },
              {
                key: "timezone",
                value: [Intl.DateTimeFormat().resolvedOptions().timeZone],
              },
              {
                key: "cookiesEnabled",
                value: [String(navigator.cookieEnabled)],
              },
              {
                key: "isInFarcasterApp",
                value: [String(isInMiniApp)],
              },
              {
                key: "chainId",
                value: [config.destinationChain?.id.toString()],
              },
            ],
          };
          if (farcasterCtx) {
            context.facts.push({
              key: "farcasterContext",
              value: [
                JSON.stringify({
                  fid: farcasterCtx.user?.fid,
                  username: farcasterCtx.user?.username,
                }),
              ],
            });
          }
          const tag = await tagUser(context);
          setTagSnitch(tag);
        } catch (e) {
          console.error(e instanceof Error ? e.message : e);
        }
      })();
    }
  }, [trackingConsent, isInMiniApp, farcasterCtx, account?.address, chainId]);

  useEffect(() => {
    if (tagSnitch && trackingConsent && config.NEXT_PUBLIC_CHAIN !== "testnet")
      hitUser({
        page: pathname,
        property: "9lives",
        tag: tagSnitch,
        referrer: document.referrer,
      });
  }, [pathname, tagSnitch, trackingConsent]);

  return null;
}

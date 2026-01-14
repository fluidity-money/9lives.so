"use client";

import Link from "next/link";
import { useEffect, useCallback } from "react";
import { deniedConsent, grantedConsent } from "@/components/googleAnalytics";
import Button from "./themed/button";
import { useUserStore } from "@/stores/userStore";

function gtag(...args: (string | Record<string, string>)[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(...args);
}

function useConsentMode(
  isInMiniApp: boolean,
  setTrackingConsent: (value: boolean) => void,
) {
  const consent =
    typeof window !== "undefined"
      ? window.localStorage.getItem("consentMode")
      : null;

  const consentMode = consent
    ? (JSON.parse(consent) as typeof grantedConsent | typeof deniedConsent)
    : null;

  const shouldShowDialog =
    !isInMiniApp && (!consent || consentMode?.ad_storage === "denied");

  const denyCookies = useCallback(() => {
    gtag("consent", "update", deniedConsent);
    window.localStorage.setItem("consentMode", JSON.stringify(deniedConsent));
    setTrackingConsent(false);
  }, [setTrackingConsent]);

  const allowCookies = useCallback(() => {
    gtag("consent", "update", grantedConsent);
    window.localStorage.setItem("consentMode", JSON.stringify(grantedConsent));
    setTrackingConsent(true);
  }, [setTrackingConsent]);

  useEffect(() => {
    if (isInMiniApp) {
      allowCookies();
    }
  }, [isInMiniApp, allowCookies]);

  return {
    shouldShowDialog,
    allowCookies,
    denyCookies,
  };
}

export default function CookieBanner() {
  const setTrackingConsent = useUserStore((s) => s.setTrackingConsent);
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);

  const { shouldShowDialog, allowCookies, denyCookies } = useConsentMode(
    isInMiniApp,
    setTrackingConsent,
  );

  if (!shouldShowDialog) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto my-10 flex max-w-max flex-col items-center justify-between gap-4 border border-9black bg-9yellow p-3 text-xs text-9black shadow-9cookieCard sm:flex-row md:max-w-[480px] md:px-4">
      <div className="text-center">
        <Link target="_blank" href="https://static.9lives.so/privacy.pdf">
          <p className="font-bold tracking-wide">We use cookies on our site.</p>
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          className="px-5 py-2 font-chicago underline"
          onClick={denyCookies}
        >
          Decline
        </button>
        <Button onClick={allowCookies}>Allow Cookies</Button>
      </div>
    </div>
  );
}

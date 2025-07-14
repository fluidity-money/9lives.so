"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { deniedConsent, grantedConsent } from "@/components/googleAnalytics";
import Button from "./themed/button";
import { useUserStore } from "@/stores/userStore";

function gtag(...args: any[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(...args);
}

export default function CookieBanner() {
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const setTrackingConsent = useUserStore((s) => s.setTrackingConsent);
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);

  function denyCookies() {
    gtag("consent", "update", deniedConsent);
    window.localStorage.setItem("consentMode", JSON.stringify(deniedConsent));
    setShowConsentDialog(false);
    setTrackingConsent(false);
  }

  function allowCookies() {
    gtag("consent", "update", grantedConsent);
    window.localStorage.setItem("consentMode", JSON.stringify(grantedConsent));
    setShowConsentDialog(false);
    setTrackingConsent(true);
  }

  useEffect(() => {
    const consent = window.localStorage.getItem("consentMode");
    if (!consent) {
      setShowConsentDialog(true);
      return;
    }
    const consentMode = JSON.parse(consent) as
      | typeof grantedConsent
      | typeof deniedConsent;
    if (consentMode.ad_storage === "denied") {
      setShowConsentDialog(true);
      return;
    }
  }, []);

  if (!showConsentDialog || isInMiniApp) return null;

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

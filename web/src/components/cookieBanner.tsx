"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Button from "./themed/button";

function allowGtag() {
  window.gtag("consent", "update", {
    ad_user_data: "granted",
    ad_personalization: "granted",
    ad_storage: "granted",
    analytics_storage: "granted",
  });
}

export default function CookieBanner() {
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  function denyCookies() {
    window.localStorage.setItem("cookie_consent", "denied");
    setShowConsentDialog(false);
  }

  function allowCookies() {
    allowGtag();
    window.localStorage.setItem("cookie_consent", "granted");
    setShowConsentDialog(false);
  }

  useEffect(() => {
    const consent = window.localStorage.getItem("cookie_consent");

    if (!consent || consent === "denied") {
      setShowConsentDialog(true);
    } else {
      allowGtag();
    }
  }, []);

  if (!showConsentDialog) return null;

  return (
    <div className="shadow-9cookieCard fixed inset-x-0 bottom-0 z-50 mx-auto my-10 flex max-w-max flex-col items-center justify-between gap-4 border border-9black bg-9yellow p-3 text-xs text-9black shadow sm:flex-row md:max-w-[480px] md:px-4">
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

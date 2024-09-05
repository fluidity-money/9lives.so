"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto my-10 flex max-w-max flex-col items-center justify-between gap-4 rounded-lg bg-[#1E1E1E] p-3 shadow sm:flex-row md:max-w-screen-sm md:px-4">
      <div className="text-center text-white">
        <Link href="https://static.purr.stream/privacy.pdf">
          <p>
            We use <span className="font-bold">cookies</span> on our site.
          </p>
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          className="rounded-md border-gray-900 px-5 py-2 text-gray-300"
          onClick={denyCookies}
        >
          Decline
        </button>
        <button
          className="rounded-lg bg-white px-5 py-2 text-black"
          onClick={allowCookies}
        >
          Allow Cookies
        </button>
      </div>
    </div>
  );
}

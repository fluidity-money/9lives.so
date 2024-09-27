"use client";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";

export const grantedConsent = {
  ad_storage: "granted",
  analytics_storage: "granted",
  functionality_storage: "granted",
  personalization_storage: "granted",
  security_storage: "granted",
} as const;

export const deniedConsent = {
  ad_storage: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "denied",
} as const;

export default function GoogleAnalytics() {
  const gtmId = "GTM-WTCHD5T9";

  return (
    <>
      <Script id="google-consent" strategy="afterInteractive">
        {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}

                if (localStorage.getItem('consentMode') === null) {
                  gtag('consent', 'default', ${JSON.stringify(deniedConsent)});
                } else {
                    gtag('consent', 'default', JSON.parse(localStorage.getItem('consentMode')));
                }

                if (localStorage.getItem('userId') != null) {
                  window.dataLayer.push({
                    'walletAddress': localStorage.getItem('walletAddress')
                });
        }
                `}
      </Script>
      <GoogleTagManager gtmId={gtmId} />
    </>
  );
}

"use client";
import Script from "next/script";

export default function GoogleAnalytics() {
  const id = "GTM-WTCHD5T9";
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'analytics_storage': 'denied'
                });

                gtag('config', '${id}', {
                    page_path: window.location.pathname,
                });
                `}
      </Script>
    </>
  );
}

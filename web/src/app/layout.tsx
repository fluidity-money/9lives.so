import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/providers";
import { combineClass } from "@/utils/combineClass";
import GoogleAnalytics from "@/components/googleAnalytics";
import appConfig from "@/config";
import CustomToaster from "@/components/customToaster";
import { getCachedCampaigns } from "@/serverData/getCampaigns";
import { getCachedTotalUserCount } from "@/serverData/getTotalUserCount";
import CookieBanner from "@/components/cookieBanner";
import { BuyAndSellResponse, CreationResponse } from "@/types";
import {
  getCachedBuysAndSells,
  getCachedCreations,
} from "../serverData/getActions";
import DegenModeFloatingButton from "@/components/degenMode/degenModeFloatingButton";
import EmailSuggester from "@/components/emailSuggester";
import Changelog from "@/components/changelog";

const chicago = localFont({
  src: [
    {
      path: "../../public/fonts/chicago-12.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-chicago",
});
const geneva = localFont({
  src: [
    {
      path: "../../public/fonts/geneva-9.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-geneva",
});
const arial = localFont({
  src: [
    {
      path: "../../public/fonts/arial.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/arial-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-arial",
});
export const metadata: Metadata = {
  ...appConfig.metadata,
  other: {
    "fc:miniapp": JSON.stringify({
      version: appConfig.frame.version,
      imageUrl: appConfig.frame.imageUrl,
      button: appConfig.frame.button,
    }),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [campaigns, totalUserCount, degenCreations, degenBuysAndSells] =
    await Promise.all([
      getCachedCampaigns(),
      getCachedTotalUserCount(),
      getCachedCreations() as Promise<CreationResponse>,
      getCachedBuysAndSells() as Promise<BuyAndSellResponse>,
    ]);
  return (
    <html
      lang="en"
      className={combineClass([
        chicago.variable,
        geneva.variable,
        arial.className,
        arial.variable,
      ])}
    >
      <body className="flex min-h-screen flex-col bg-9layer">
        <Providers
          initialData={{
            campaigns,
            totalUserCount,
            degenCreations,
            degenBuysAndSells,
          }}
        >
          {children}
          <DegenModeFloatingButton />
          <EmailSuggester />
          <Changelog />
        </Providers>
        <CookieBanner />
        <CustomToaster />
      </body>
      <GoogleAnalytics />
    </html>
  );
}

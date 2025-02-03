import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { combineClass } from "@/utils/combineClass";
import GoogleAnalytics from "@/components/googleAnalytics";
import appConfig from "@/config";
import CustomToaster from "@/components/customToaster";
import { getCachedCampaigns } from "@/serverData/getCampaigns";
import { getCachedTotalUserCount } from "@/serverData/getTotalUserCount";
import CookieBanner from "@/components/cookieBanner";
import DegenModeWrapper from "@/components/degenMode/degenModeWrapper";
import { BuyAndSellResponse, CreationResponse } from "@/types";
import {
  getCachedBuysAndSells,
  getCachedCreations,
} from "../serverData/getActions";
import DegenModeFloatingButton from "@/components/degenMode/degenModeFloatingButton";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const campaigns = await getCachedCampaigns();
  const totalUserCount = await getCachedTotalUserCount();
  const degenCreations = (await getCachedCreations()) as CreationResponse;
  const degenBuysAndSells =
    (await getCachedBuysAndSells()) as BuyAndSellResponse;
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
          <Header />
          <main className="flex flex-1 gap-2">
            <div className="flex-1 p-4">{children}</div>
            <DegenModeWrapper />
          </main>
          <Footer />
          <DegenModeFloatingButton />
        </Providers>
        <CookieBanner />
        <CustomToaster />
      </body>
      <GoogleAnalytics />
    </html>
  );
}

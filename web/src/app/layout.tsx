import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { combineClass } from "@/utils/combineClass";
import GoogleAnalytics from "@/components/googleAnalytics";
import dynamic from "next/dynamic";
import appConfig from "@/config";
import {
  requestCampaignList,
  requestTotalUserCount,
} from "@/providers/graphqlClient";
import { unstable_cache } from "next/cache";
import { Campaign } from "@/types";
import CustomToaster from "@/components/customToaster";

const CookieBanner = dynamic(() => import("@/components/cookieBanner"), {
  ssr: false,
});

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

const getCampaigns = unstable_cache(
  async () => {
    return (await requestCampaignList).campaigns as Campaign[];
  },
  ["campaigns"],
  { revalidate: appConfig.cacheRevalidation.homePage, tags: ["campaigns"] },
);

const getTotalUserCount = unstable_cache(
  async () => {
    return (await requestTotalUserCount).productUserCount as number;
  },
  ["totalUserCount"],
  {
    revalidate: appConfig.cacheRevalidation.homePage,
    tags: ["totalUserCount"],
  },
);

export const metadata: Metadata = {
  ...appConfig.metadata,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const campaigns = await getCampaigns();
  const totalUserCount = await getTotalUserCount();
  return (
    <html
      lang="en"
      className={combineClass([chicago.variable, geneva.variable])}
    >
      <body className="flex min-h-screen flex-col items-center bg-9layer">
        <Providers initialData={{ campaigns, totalUserCount }}>
          <Header />
          <main className="mx-auto flex max-w-screen-xl flex-1 p-4">
            {children}
          </main>
          <Footer />
        </Providers>
        <CookieBanner />
        <CustomToaster />
      </body>
      <GoogleAnalytics />
    </html>
  );
}

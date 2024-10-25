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
import { requestCampaignList } from "@/providers/graphqlClient";
import { unstable_cache } from "next/cache";
import { Campaign } from "@/types";
import { Toaster } from "react-hot-toast";

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

export const metadata: Metadata = {
  ...appConfig.metadata,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialData = await getCampaigns();
  return (
    <html
      lang="en"
      className={combineClass([chicago.variable, geneva.variable])}
    >
      <body className="flex min-h-screen flex-col bg-9layer">
        <Toaster
          toastOptions={{
            position: "top-right",
          }}
        />
        <Providers initialData={initialData}>
          <Header />
          <main className="flex flex-1 p-4">{children}</main>
          <Footer />
        </Providers>
        <CookieBanner />
      </body>
      <GoogleAnalytics />
    </html>
  );
}

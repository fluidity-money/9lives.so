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
import { getCampaigns } from "@/serverData/getCampaigns";
import { getCachedTotalUserCount } from "@/serverData/getTotalUserCount";
import CookieBanner from "@/components/cookieBanner";

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
export const metadata: Metadata = {
  ...appConfig.metadata,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const campaigns = await getCampaigns();
  const totalUserCount = await getCachedTotalUserCount();
  return (
    <html
      lang="en"
      className={combineClass([chicago.variable, geneva.variable])}
    >
      <body className="flex min-h-screen flex-col items-center bg-9layer">
        <Providers initialData={{ campaigns, totalUserCount }}>
          <Header />
          <main className="mx-auto flex max-w-screen-xl flex-1 p-4 md:w-[1280px]">
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

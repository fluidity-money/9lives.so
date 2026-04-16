import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import appConfig from "@/config";
import Providers from "@/providers";
import { headers } from "next/headers";
import GoogleAnalytics from "@/components/googleAnalytics";
import CustomToaster from "@/components/v2/customToaster";
import CookieBanner from "@/components/v2/cookie";
import Header from "@/components/v2/header";
import Footer from "@/components/v2/footer";
import BetaTesterInvitation from "@/components/v2/betatester";
import TickerBar from "@/components/tickerBar";
import { combineClass } from "@/utils/combineClass";

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

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const overusedGrotesk = localFont({
  src: [
    { path: "../../fonts/OverusedGrotesk-Roman.ttf", weight: "400" },
    { path: "../../fonts/OverusedGrotesk-Medium.ttf", weight: "500" },
    { path: "../../fonts/OverusedGrotesk-SemiBold.ttf", weight: "600" },
    { path: "../../fonts/OverusedGrotesk-Bold.ttf", weight: "700" },
    { path: "../../fonts/OverusedGrotesk-ExtraBold.ttf", weight: "800" },
    { path: "../../fonts/OverusedGrotesk-Black.ttf", weight: "900" },
  ],
  variable: "--font-overused-grotesk",
  display: "swap",
});

export default async function WideLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");
  return (
    <html
      lang="en"
      className={combineClass(
        dmSans.className,
        dmMono.variable,
        overusedGrotesk.variable,
      )}
    >
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body className="flex min-h-screen flex-col bg-2white">
        <Providers cookies={cookies} version="2">
          <Header />
          <TickerBar />
          <main className="flex w-full flex-1">
            <div className="flex-1">{children}</div>
          </main>
          <Footer />
          <BetaTesterInvitation />
        </Providers>
        <CookieBanner />
        <CustomToaster />
      </body>
      <GoogleAnalytics />
    </html>
  );
}
